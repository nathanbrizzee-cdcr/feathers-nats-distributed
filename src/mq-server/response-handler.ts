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
import { getServiceName } from "../common/helpers"
import { ServiceMethods, Reply } from "../common/types"
import { jsonCodec } from "../instance"
import Debug from "debug"
const debug = Debug("feathers-nats-distributed:server:response-handler")
export default class natsResponse {
  private app: any // FeathersJS app object
  private nats: NatsConnection
  private appName: string
  private Services: string[]

  constructor(app: any, appName: string, nats: NatsConnection) {
    this.app = app
    this.appName = appName
    this.nats = nats
    this.Services = Object.keys(app.services)
  }

  /**
   *
   * @param serviceMethod One of
   * @returns
   */
  public async createService(
    serviceMethod: ServiceMethods
  ): Promise<Subscription> {
    const queueOpts: SubscriptionOptions = {
      queue: `service.${this.appName}.${serviceMethod}.>`,
    }
    debug("Creating service subscription queue on ", queueOpts.queue)
    // create a subscription - note the option for a queue, if set
    // any client with the same queue will be a member of the receiving group.
    const sub = this.nats.subscribe(<string>queueOpts.queue, queueOpts)
    ;(async () => {
      for await (const m of sub) {
        try {
          const svcInfo = getServiceName(m.subject)

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
          const request: any = jsonCodec.decode(m.data)
          debug(JSON.stringify({ svcInfo, request }, null, 2))
          switch (serviceMethod) {
            case ServiceMethods.Find:
              result = await this.app
                .service(svcInfo.serviceName)
                .find(request.params)
              break

            case ServiceMethods.Get:
              result = await this.app
                .service(svcInfo.serviceName)
                .get(request.id, request.params)
              break
            case ServiceMethods.Create:
              result = await this.app
                .service(svcInfo.serviceName)
                .create(request.data, request.params)
              break
            case ServiceMethods.Patch:
              result = await this.app
                .service(svcInfo.serviceName)
                .patch(request.id, request.data, request.params)
              break
            case ServiceMethods.Update:
              result = await this.app
                .service(svcInfo.serviceName)
                .update(request.id, request.data, request.params)
              break
            case ServiceMethods.Remove:
              result = await this.app
                .service(svcInfo.serviceName)
                .remove(request.id, request.params)
              break
            default:
              result = {}
              break
          }

          const reply: Reply = { data: result }
          // respond returns true if the message had a reply subject, thus it could respond
          if (m.respond(jsonCodec.encode(reply))) {
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
          const errObj: Reply = { error: err }
          if (m.respond(jsonCodec.encode(errObj))) {
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
