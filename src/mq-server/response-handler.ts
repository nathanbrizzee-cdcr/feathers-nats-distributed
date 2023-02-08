"use strict"
import { promises as fsPromises } from "fs"
import * as path from "path"
import {
  StringCodec,
  JSONCodec,
  Codec,
  Service,
  ServiceInfo,
  ServiceGroup,
  ServiceConfig,
  NatsConnection,
  Subscription,
  SubscriptionOptions,
  Msg,
} from "nats"
import { GeneralError, NotFound, MethodNotAllowed } from "@feathersjs/errors"
import Debug from "debug"
const debug = Debug("feathers-nats-distributed:server:responses:index")

type ServiceActions = {
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
    // const [, serviceName, methodName] = natsSubject.split(".")
    const subjectParts: string[] = natsSubject.split(".")
    const serviceActions: ServiceActions = {
      serviceName: "",
      methodName: "",
    }
    serviceActions.serviceName =
      subjectParts[Math.max(subjectParts.length - 2, 0)]
    serviceActions.methodName =
      subjectParts[Math.max(subjectParts.length - 1, 0)]

    debug(
      `${serviceActions.methodName} request for ${this.appName}.${serviceActions.serviceName}`
    )
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

  public async createService(
    serviceType: string,
    queueName: string = ""
  ): Promise<Subscription> {
    const queueOpts: SubscriptionOptions = {
      queue: `${this.appName}.${serviceType}.>`, // `${appName}.*.find`
    }
    // create a subscription - note the option for a queue, if set
    // any client with the same queue will be a member of the group.
    const sub = this.nats.subscribe(<string>queueOpts.queue, queueOpts)
    for await (const m of sub) {
      const svcInfo = this.getServiceName(m.subject)

      // check if service is registered
      if (!this.Services.includes(svcInfo.serviceName)) {
        const errorResponse = new NotFound()
        debug("error response %O", errorResponse)
        if (m.respond(this.jsonCodec.encode(errorResponse))) {
          console.log(
            `[${queueName}] #${sub.getProcessed()} echoed ${this.stringCodec.decode(
              m.data
            )}`
          )
        } else {
          console.log(
            `[${queueName}] #${sub.getProcessed()} ignoring request - no reply subject`
          )
        }
        continue
      }

      const availableMethods = Object.keys(
        this.app.services[svcInfo.serviceName]
      )
      // check if the 'service method' is registered
      if (!availableMethods.includes(svcInfo.methodName)) {
        const errorResponse = new MethodNotAllowed(
          `Method \`${svcInfo.methodName}\` is not supported by this endpoint.`
        )
        debug("error response %O", errorResponse)
        if (m.respond(this.jsonCodec.encode(errorResponse))) {
          console.log(
            `[${queueName}] #${sub.getProcessed()} echoed ${this.jsonCodec.decode(
              m.data
            )}`
          )
        } else {
          console.log(
            `[${queueName}] #${sub.getProcessed()} ignoring request - no reply subject`
          )
        }
        continue
      }

      const request: any = this.jsonCodec.decode(m.data)
      debug({ svcInfo, request })

      let result: any
      try {
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

        // respond returns true if the message had a reply subject, thus it could respond
        const retal = m.respond(this.jsonCodec.encode(result))
      } catch (err: any) {
        delete err.hook
        m.respond(this.jsonCodec.encode(this.wrapError(err)))
      }
    }
    return sub
  }
}
