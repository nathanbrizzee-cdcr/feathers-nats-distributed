"use strict"
import {
  StringCodec,
  JSONCodec,
  Codec,
  NatsConnection,
  Subscription,
  SubscriptionOptions,
} from "nats"
import { NotFound, MethodNotAllowed } from "@feathersjs/errors"
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

    debug(
      `service request for app=${serviceActions.serverName}; method=${serviceActions.methodName}; service=${serviceActions.serviceName};`
    )
    return serviceActions
  }
  // {
  //   "stack":"NotFound: No record found for id '1' at UserService._get (/home/vagrant/code/feathers5/feathers-chat/node_modules/@feathersjs/knex/lib/adapter.js:169:19)  at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async UserService.<anonymous> (/home/vagrant/code/feathers5/feathers-chat/node_modules/@feathersjs/schema/lib/hooks/resolve.js:81:13)\n    at async UserService.<anonymous> (/home/vagrant/code/feathers5/feathers-chat/node_modules/@feathersjs/schema/lib/hooks/resolve.js:124:9)\n    at async UserService.logError (/home/vagrant/code/feathers5/feathers-chat/lib/hooks/log-error.js:7:9)",
  //   "message":"No record found for id '1'",
  //   "name":"NotFound",
  //   "code":404,
  //   "className":"not-found",
  //   "type":"FeathersError",
  //   "__mqError":{
  //     "stack":"NotFound: No record found for id '1'\n    at UserService._get (/home/vagrant/code/feathers5/feathers-chat/node_modules/@feathersjs/knex/lib/adapter.js:169:19)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async UserService.<anonymous> (/home/vagrant/code/feathers5/feathers-chat/node_modules/@feathersjs/schema/lib/hooks/resolve.js:81:13)\n    at async UserService.<anonymous> (/home/vagrant/code/feathers5/feathers-chat/node_modules/@feathersjs/schema/lib/hooks/resolve.js:124:9)\n    at async UserService.logError (/home/vagrant/code/feathers5/feathers-chat/lib/hooks/log-error.js:7:9)",
  //     "message":"No record found for id '1'",
  //     "name":"NotFound",
  //     "code":404,
  //     "className":"not-found",
  //     "type":"FeathersError"}
  //   }

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
    for await (const m of sub) {
      const svcInfo = this.getServiceName(m.subject)

      // check if service is registered
      if (!this.Services.includes(svcInfo.serviceName)) {
        const errorResponse = new NotFound(
          `Service \`${svcInfo.serviceName}\` is not registered in this server.`
        )
        debug("error response %O", errorResponse)
        if (m.respond(this.jsonCodec.encode(errorResponse))) {
          console.log(
            `[${
              svcInfo.serverName
            }] #${sub.getProcessed()} echoed ${this.stringCodec.decode(m.data)}`
          )
        } else {
          console.log(
            `[${
              svcInfo.serverName
            }] #${sub.getProcessed()} ignoring request - no reply subject`
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
            `[${
              svcInfo.serverName
            }] #${sub.getProcessed()} echoed ${this.jsonCodec.decode(m.data)}`
          )
        } else {
          console.log(
            `[${
              svcInfo.serverName
            }] #${sub.getProcessed()} ignoring request - no reply subject`
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
        debug(err)
        //const newErr = this.wrapError(err)
        //debug(newErr)
        delete err.stack
        m.respond(this.jsonCodec.encode(err))
      }
    }
    return sub
  }
}
