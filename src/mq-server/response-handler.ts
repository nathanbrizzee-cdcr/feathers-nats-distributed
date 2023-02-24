"use strict"
import {
  StringCodec,
  JSONCodec,
  Codec,
  NatsConnection,
  Subscription,
  SubscriptionOptions,
} from "nats"
import { NotFound, MethodNotAllowed, BadRequest } from "@feathersjs/errors"
import {
  getServiceName,
  makeNatsQueueOption,
  makeNatsPubSubjectName,
  makeNatsSubjectName,
} from "../common/helpers"
import {
  ServiceMethods,
  Reply,
  ServiceActions,
  ServiceTypes,
  ServerConfig,
  ServerInfo,
  RequestParams,
  ServiceEventTypes,
} from "../common/types"
import { jsonCodec } from "../instance"
import Debug from "debug"
const debug = Debug("feathers-nats-distributed:server:response-handler")

/**A Set to keep track of service names that have listeners added to them */
const serviceListeners = new Set()
export default class natsResponse {
  private app: any // FeathersJS app object
  private nats: NatsConnection
  private config: ServerConfig
  /**List of services in this server.  loaded at class creation */
  private allServices: string[]
  private Services: string[]
  private timer: any
  private serverInfo: ServerInfo

  constructor(app: any, config: ServerConfig, nats: NatsConnection) {
    this.app = app
    this.config = Object.assign({}, config) // make a copy of the config
    this.nats = nats
    this.allServices = Object.keys(app.services)
    this.Services = this.allServices
    this.timer = null
    this.serverInfo = {
      name: this.config.appName,
      version: this.config.appVersion,
      id: this.config.appInstanceID as string,
    }

    if (
      this.config.servicePublisher?.publishServices === true &&
      this.config.servicePublisher?.servicesIgnoreList
    ) {
      // Sanitize ignore service list if it exists
      for (
        let cnt = 0;
        cnt < this.config.servicePublisher.servicesIgnoreList.length;
        cnt++
      ) {
        if (
          this.config.servicePublisher.servicesIgnoreList[cnt].startsWith("/")
        ) {
          this.config.servicePublisher.servicesIgnoreList[cnt] =
            this.config.servicePublisher.servicesIgnoreList[cnt].replace(
              "/",
              ""
            )
        }
      }
      this.Services = [] // clear the list so we can reload it
      // Check if any of the registered services are listed to be ignored
      this.allServices.forEach(serviceName => {
        const found = this.config.servicePublisher?.servicesIgnoreList?.some(
          item => item === serviceName
        )
        // If not found in the ignore list, add it to the services list
        if (!found) {
          this.Services.push(serviceName)
        }
      })
    }
  }
  public static getRandomInt(min: number = 1, max: number = 360000) {
    min = Math.ceil(Math.max(min, 1))
    max = Math.floor(Math.min(max, 360000))
    return Math.floor(Math.random() * (max - min) + min) // The maximum is exclusive and the minimum is inclusive
  }

  public async startServicePublisher(): Promise<void> {
    if (this.config.servicePublisher?.publishServices === true) {
      const randDelaySecs = natsResponse.getRandomInt(5000, 10000)
      const fixedDelaySecs =
        Math.max(this.config.servicePublisher?.publishDelay || 60000, 1000) ||
        60000
      debug(
        `Waiting ${randDelaySecs} ms to start publishling services; then publishing every ${fixedDelaySecs} ms`
      )
      const self = this
      self.timer = setTimeout(async function myTimer(): Promise<void> {
        await self._publishServices(self)
        self.timer = setTimeout(myTimer, fixedDelaySecs)
      }, randDelaySecs)
    }
  }

  public stopServicePublisher(): void {
    if (this.config.servicePublisher?.publishServices === true) {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    }
  }

  private async _publishServices(self: any): Promise<void> {
    try {
      const serviceActions: ServiceActions = {
        servicePath: "",
        serverName: self.config.appName,
        methodName: ServiceMethods.Unknown,
        serviceType: ServiceTypes.ServiceList,
      }
      const subject = makeNatsPubSubjectName(serviceActions)
      const msg: Object = {
        serverInfo: self.serverInfo,
        services: self.Services,
      }
      // debug(
      //   `Publishling service list to NATS subject ${subject}, ${JSON.stringify(
      //     msg
      //   )}`
      // )
      if (self.nats && !self.nats.isDraining() && !self.nats.isClosed()) {
        await self.nats.publish(subject, jsonCodec.encode(msg))
      } else {
        debug("_publishServices: NATS connecton is draining or is closed")
      }
    } catch (e) {
      debug(e)
      throw e
    }
  }
  private async _publishEvent(self: any, subject: string, message: any) {
    if (self.nats && !self.nats.isDraining() && !self.nats.isClosed()) {
      try {
        debug(`Publishing Event to NATS subject ${subject}`)
        const reply: Reply = { data: message, serverInfo: self.serverInfo }
        await self.nats.publish(subject, jsonCodec.encode(reply))
      } catch (e) {
        // swallow the error since we can't do much about it
        debug(e)
      }
    } else {
      debug("_publishEvent: NATS connecton is draining or is closed")
    }
  }

  /**
   * Creates a new service handler for a service method
   * @param serviceMethod Which service method to create a listener for
   */
  public async createService(
    serviceMethod: ServiceMethods
  ): Promise<Subscription> {
    const queueOpts: SubscriptionOptions = {
      queue: makeNatsQueueOption({
        serviceType: ServiceTypes.Service,
        serverName: this.config.appName,
        methodName: serviceMethod,
        servicePath: "",
      }),
    }

    debug("Creating service subscription queue on", queueOpts.queue)
    // create a subscription - note the option for a queue, if set
    // any client with the same queue will be a member of the receiving group.
    const sub = this.nats.subscribe(<string>queueOpts.queue, queueOpts)
    ;(async () => {
      for await (const m of sub) {
        try {
          const svcInfo: ServiceActions = getServiceName(m.subject)
          // debug(svcInfo)
          // check if service is registered
          if (!this.Services.includes(svcInfo.servicePath)) {
            throw new NotFound(
              `Service \`${svcInfo.servicePath}\` is not registered in this server.`
            )
          }
          const service = this.app.services[svcInfo.servicePath]
          const availableMethods = Object.keys(service)
          // check if the 'service method' is registered
          if (!availableMethods.includes(svcInfo.methodName)) {
            throw new MethodNotAllowed(
              `Method \`${svcInfo.methodName}\` is not supported by this endpoint.`
            )
          }

          // Register event listeners to forward the events over NATS
          // We register the events only once.  Each time we call the .on function,
          // it registers another handler so we only want to add them once
          const serviceKey: string = `${serviceMethod}.${svcInfo.servicePath}`
          if (!serviceListeners.has(serviceKey)) {
            serviceListeners.add(serviceKey)
            debug(`Registering Event listener for key ${serviceKey}`)
            const action: ServiceActions = Object.assign({}, svcInfo)
            action.serviceType = ServiceTypes.Event

            const subject = makeNatsSubjectName(action)
            // debug(JSON.stringify({ subject, action }))
            const self = this
            switch (serviceMethod) {
              case ServiceMethods.Create:
                service.on(ServiceEventTypes.Created, (message: any) => {
                  debug("created event:", message)
                  self._publishEvent(self, subject, message)
                })
                break
              case ServiceMethods.Update:
                service.on(ServiceEventTypes.Updated, (message: any) => {
                  debug("updated event:", message)
                  self._publishEvent(self, subject, message)
                })
                break
              case ServiceMethods.Patch:
                service.on(ServiceEventTypes.Patched, (message: any) => {
                  debug("patched event:", message)
                  self._publishEvent(self, subject, message)
                })
                break
              case ServiceMethods.Remove:
                service.on(ServiceEventTypes.Removed, (message: any) => {
                  debug("removed event:", message)
                  self._publishEvent(self, subject, message)
                })
                break
              default:
                break
            }
          }

          let result: any
          const data: any = jsonCodec.decode(m.data)
          debug(JSON.stringify({ svcInfo, reply: data }))
          const request = data.request as RequestParams

          switch (serviceMethod) {
            case ServiceMethods.Find:
              result = await service.find(request.params)
              break
            case ServiceMethods.Get:
              result = await service.get(request.id, request.params)
              break
            case ServiceMethods.Create:
              result = await service.create(request.data, request.params)
              break
            case ServiceMethods.Patch:
              result = await service.patch(
                request.id,
                request.data,
                request.params
              )
              break
            case ServiceMethods.Update:
              result = await service.update(
                request.id,
                request.data,
                request.params
              )
              break
            case ServiceMethods.Remove:
              result = await service.remove(request.id, request.params)
              break
            default:
              result = {}
              break
          }

          const reply: Reply = { data: result, serverInfo: this.serverInfo }
          // respond returns true if the message had a reply subject, thus it could respond
          if (m.respond(jsonCodec.encode(reply))) {
            debug(
              `[${
                this.config.appName
              }] reply #${sub.getProcessed()} => ${JSON.stringify(reply)}`
            )
          } else {
            debug(
              `[${
                this.config.appName
              }] #${sub.getProcessed()} ignoring request - no reply subject`
            )
          }
        } catch (err: any) {
          delete err.hook
          debug(err)
          delete err.stack
          if (
            err.code &&
            typeof err.code === "string" &&
            err.code === "BAD_JSON"
          ) {
            err = new BadRequest("Invalid JSON request received")
            debug(err)
          }
          const errObj: Reply = { error: err, serverInfo: this.serverInfo }
          if (m.respond(jsonCodec.encode(errObj))) {
            debug(
              `[${
                this.config.appName
              }] reply #${sub.getProcessed()} => ${JSON.stringify(errObj)}`
            )
          } else {
            debug(
              `[${
                this.config.appName
              }] #${sub.getProcessed()} ignoring request - no reply subject`
            )
          }
        }
      }
      console.log("subscription closed")
    })()

    return sub
  }
}
