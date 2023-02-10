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
import Debug from "debug"
const debug = Debug("feathers-nats-distributed:server:response-handler")

type ServiceActions = {
  serverName: string
  serviceName: string
  methodName: string
}

type StringMap = { [key: string]: string }

export default class natsResponse {
  private app: any // FeathersJS app object
  private nats: NatsConnection
  private jsonCodec: Codec<unknown> = JSONCodec()
  private stringCodec: Codec<string> = StringCodec()
  private appName: string
  private Services: string[]

  constructor(app: any, appName: string, nats: NatsConnection) {
    this.app = app
    this.appName = appName
    this.nats = nats
    this.Services = Object.keys(app.services)
  }

  private getServiceName(natsSubject: string): ServiceActions {
    // natsSubject should look like this "ServerName.get.users"
    const subjectParts: string[] = natsSubject.split(".")
    const serviceActions: ServiceActions = {
      serverName: "",
      serviceName: "",
      methodName: "",
    }
    serviceActions.serverName = subjectParts[0]
    if (subjectParts.length > 1) {
      serviceActions.methodName = subjectParts[1]
    }
    if (subjectParts.length > 2) {
      serviceActions.serviceName = subjectParts.slice(2).join("/")
    }
    return serviceActions
  }

  private wrapError(error: any) {
    const newError: StringMap = {}
    const __mqError: StringMap = {}

    Object.getOwnPropertyNames(error).forEach(key => {
      newError[key] = error[key] // For older versions
      __mqError[key] = error[key]
    })

    //@ts-expect-error
    newError.__mqError = __mqError
    return newError
  }

  public async createService(serviceType: string): Promise<Subscription> {
    const queueOpts: SubscriptionOptions = {
      queue: `${this.appName}.${serviceType}.>`,
    }
    debug("Creating subscription queue on ", queueOpts)
    // create a subscription - note the option for a queue, if set
    // any client with the same queue will be a member of the group.
    const sub = this.nats.subscribe(<string>queueOpts.queue, queueOpts)
    ;(async () => {
      for await (const m of sub) {
        try {
          const svcInfo = this.getServiceName(m.subject)

          // check if service is registered
          if (!this.Services.includes(svcInfo.serviceName)) {
            throw new NotFound(
              `Service \`${svcInfo.serviceName}\` is not registered in this server.`
            )
          }

          const availableMethods = Object.keys(
            this.app.services[svcInfo.serviceName]
          )
          // check if the 'service method' is registered
          if (!availableMethods.includes(svcInfo.methodName)) {
            throw new MethodNotAllowed(
              `Method \`${svcInfo.methodName}\` is not supported by this endpoint.`
            )
          }

          let result: any
          const request: any = this.jsonCodec.decode(m.data)
          debug(JSON.stringify({ svcInfo, request }, null, 2))
          switch (serviceType) {
            case "find":
              result = await this.app
                .service(svcInfo.serviceName)
                .find(request.params)
              break

            case "get":
              result = await this.app
                .service(svcInfo.serviceName)
                .get(request.id, request.params)
              break
            case "create":
              result = await this.app
                .service(svcInfo.serviceName)
                .create(request.data, request.params)
              break
            case "patch":
              result = await this.app
                .service(svcInfo.serviceName)
                .patch(request.id, request.data, request.params)
              break
            case "update":
              result = await this.app
                .service(svcInfo.serviceName)
                .update(request.id, request.data, request.params)
              break
            case "remove":
              result = await this.app
                .service(svcInfo.serviceName)
                .remove(request.id, request.params)
              break
            default:
              result = {}
              break
          }

          const reply = { data: result }
          // respond returns true if the message had a reply subject, thus it could respond
          if (m.respond(this.jsonCodec.encode(reply))) {
            debug(
              `[${
                this.appName
              }] reply #${sub.getProcessed()} => ${JSON.stringify(reply)}`
            )
          } else {
            debug(
              `[${
                this.appName
              }] #${sub.getProcessed()} ignoring request - no reply subject`
            )
          }
        } catch (err: any) {
          delete err.hook
          debug(err)
          //const newErr = this.wrapError(err)
          //debug(newErr)
          delete err.stack
          if (
            err.code &&
            typeof err.code === "string" &&
            err.code === "BAD_JSON"
          ) {
            err = new BadRequest("Invalid JSON request received")
            debug(err)
          }
          const errObj = { error: err }
          if (m.respond(this.jsonCodec.encode(errObj))) {
            debug(
              `[${
                this.appName
              }] reply #${sub.getProcessed()} => ${JSON.stringify(errObj)}`
            )
          } else {
            debug(
              `[${
                this.appName
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
