"use strict"
import Debug from "debug"
const debug = Debug("feathers-nats-distributed:client:service")
import { BadRequest, MethodNotAllowed, NotFound } from "@feathersjs/errors"
import type { Id, NullableId, Params } from "@feathersjs/feathers"
import { FeathersKoaContext } from "@feathersjs/koa"
import { getInstance, NatsConnection } from "../instance"
import {
  InitConfig,
  ServiceActions,
  SendRequestScope,
  ServiceMethods,
  Reply,
} from "../common/types"

const { sendRequest } = require("./send-request")

// export class NatsService {
//   app: any
//   /**
//    * Feathers Path variable - which is the service name
//    */
//   serviceName: string
//   nats: NatsConnection
//   config: InitConfig
//   cookies: any
//   method: string
//   url: string
//   path: string
//   headers: any
//   body: any
//   query: any
//   querystring: string
//   constructor(
//     app: any,
//     ctx: FeathersKoaContext,
//     nats: NatsConnection,
//     config: InitConfig
//   ) {
//     this.app = app
//     this.serviceName = ctx.url
//     this.cookies = ctx.cookies
//     this.method = ctx.method.toUpperCase()
//     this.url = ctx.url
//     this.path = ctx.path
//     this.headers = ctx.headers
//     this.body = ctx.body
//     this.query = ctx.query
//     this.querystring = ctx.querystring
//     this.nats = nats
//     this.config = config
//   }

//   async callService() {
//     debug(this)
//     switch (this.method) {
//       case "GET":
//         break
//       case "FIND":
//         break
//       case "CREATE":
//         break
//       case "UPDATE":
//         break
//       case "PATCH":
//         break
//       case "REMOVE":
//         break
//     }
//   }

//   async find(_params?: Params): Promise<Array<any> | Object | undefined> {
//     const sendRequestScope: SendRequestScope = {
//       appName: this.config.appName,
//       nats: this.nats,
//       app: this.app,
//       serviceName: this.serviceName,
//       methodName: ServiceMethods.Find,
//       request: { params: _params },
//     }
//     const retval: Reply = await sendRequest(sendRequestScope)
//     return retval.data
//   }

//   async get(id: Id, _params?: Params): Promise<Object | undefined> {
//     const sendRequestScope: SendRequestScope = {
//       appName: this.config.appName,
//       nats: this.nats,
//       app: this.app,
//       serviceName: this.serviceName,
//       methodName: ServiceMethods.Get,
//       request: { id: id, params: _params },
//     }

//     const retval: Reply = await sendRequest(sendRequestScope)
//     return retval.data
//   }

//   async create(
//     data: Object | Array<any>,
//     params?: Params
//   ): Promise<Object | undefined> {
//     if (Array.isArray(data)) {
//       return Promise.all(data.map(current => this.create(current, params)))
//     }

//     const sendRequestScope: SendRequestScope = {
//       appName: this.config.appName,
//       nats: this.nats,
//       app: this.app,
//       serviceName: this.serviceName,
//       methodName: ServiceMethods.Create,
//       request: { data: data, params: params },
//     }

//     const retval: Reply = await sendRequest(sendRequestScope)
//     return retval.data
//   }

//   async update(
//     id: NullableId,
//     data: Object | Array<any>,
//     _params?: Params
//   ): Promise<Object | undefined> {
//     const sendRequestScope: SendRequestScope = {
//       appName: this.config.appName,
//       nats: this.nats,
//       app: this.app,
//       serviceName: this.serviceName,
//       methodName: ServiceMethods.Update,
//       request: { id: id, data: data, params: _params },
//     }

//     const retval: Reply = await sendRequest(sendRequestScope)
//     return retval.data
//   }

//   async patch(
//     id: NullableId,
//     data: Object | Array<any>,
//     _params?: Params
//   ): Promise<Object | undefined> {
//     const sendRequestScope: SendRequestScope = {
//       appName: this.config.appName,
//       nats: this.nats,
//       app: this.app,
//       serviceName: this.serviceName,
//       methodName: ServiceMethods.Patch,
//       request: { id: id, data: data, params: _params },
//     }

//     const retval: Reply = await sendRequest(sendRequestScope)
//     return retval.data
//   }

//   async remove(id: NullableId, _params?: Params): Promise<Object | undefined> {
//     const sendRequestScope: SendRequestScope = {
//       appName: this.config.appName,
//       nats: this.nats,
//       app: this.app,
//       serviceName: this.serviceName,
//       methodName: ServiceMethods.Remove,
//       request: { id: id, params: _params },
//     }

//     const retval: Reply = await sendRequest(sendRequestScope)
//     return retval.data
//   }
// }
export class NatsService {
  app: any
  /**
   * Feathers Path variable - which is the service name
   */
  nats: NatsConnection
  config: InitConfig
  constructor(app: any, nats: NatsConnection, config: InitConfig) {
    this.app = app
    this.nats = nats
    this.config = config
  }

  async find(
    appName: string,
    serviceName: string,
    _params?: Params
  ): Promise<Array<any> | Object | undefined> {
    const sendRequestScope: SendRequestScope = {
      appName: appName,
      nats: this.nats,
      app: this.app,
      serviceName: serviceName,
      methodName: ServiceMethods.Find,
      request: {
        params: Object.assign(
          {},
          {
            headers: _params?.headers,
            provider: _params?.provider,
            query: _params?.query,
            route: _params?.route,
          }
        ),
      },
    }
    const reply: Reply = await sendRequest(sendRequestScope)
    return reply.data
  }

  async get(
    serviceName: string,
    id: Id,
    _params?: Params
  ): Promise<Object | undefined> {
    const sendRequestScope: SendRequestScope = {
      appName: this.config.appName,
      nats: this.nats,
      app: this.app,
      serviceName: serviceName,
      methodName: ServiceMethods.Get,
      request: { id: id, params: _params },
    }

    const reply: Reply = await sendRequest(sendRequestScope)
    return reply.data
  }

  async create(
    serviceName: string,
    data: Object | Array<any>,
    params?: Params
  ): Promise<Object | undefined> {
    if (Array.isArray(data)) {
      return Promise.all(
        data.map(current => this.create(serviceName, current, params))
      )
    }

    const sendRequestScope: SendRequestScope = {
      appName: this.config.appName,
      nats: this.nats,
      app: this.app,
      serviceName: serviceName,
      methodName: ServiceMethods.Create,
      request: { data: data, params: params },
    }

    const reply: Reply = await sendRequest(sendRequestScope)
    return reply.data
  }

  async update(
    serviceName: string,
    id: NullableId,
    data: Object | Array<any>,
    _params?: Params
  ): Promise<Object | undefined> {
    const sendRequestScope: SendRequestScope = {
      appName: this.config.appName,
      nats: this.nats,
      app: this.app,
      serviceName: serviceName,
      methodName: ServiceMethods.Update,
      request: { id: id, data: data, params: _params },
    }

    const reply: Reply = await sendRequest(sendRequestScope)
    return reply.data
  }

  async patch(
    serviceName: string,
    id: NullableId,
    data: Object | Array<any>,
    _params?: Params
  ): Promise<Object | undefined> {
    const sendRequestScope: SendRequestScope = {
      appName: this.config.appName,
      nats: this.nats,
      app: this.app,
      serviceName: serviceName,
      methodName: ServiceMethods.Patch,
      request: { id: id, data: data, params: _params },
    }

    const reply: Reply = await sendRequest(sendRequestScope)
    return reply.data
  }

  async remove(
    serviceName: string,
    id: NullableId,
    _params?: Params
  ): Promise<Object | undefined> {
    const sendRequestScope: SendRequestScope = {
      appName: this.config.appName,
      nats: this.nats,
      app: this.app,
      serviceName: serviceName,
      methodName: ServiceMethods.Remove,
      request: { id: id, params: _params },
    }

    const reply: Reply = await sendRequest(sendRequestScope)
    return reply.data
  }
}

// export function NatsService(serviceName: string) {
//   // @ts-expect-error
//   const nats: NatsConnection = this.nats
//   // @ts-expect-error
//   const app: any = this.app
//   // @ts-expect-error
//   const config: InitConfig = this.config

//   if (!nats || !app || !config) {
//     throw new BadRequest("Service is missing the nats, app, or config object")
//   }
//   let finalName: string = serviceName

//   if (serviceName.startsWith("/")) {
//     finalName = serviceName.replace("/", "")
//   }

//   if (app.services[finalName]) {
//     debug(`local service: ${finalName}`)
//     return app.services[finalName]
//   }

//   // service methods
//   return {
//     id: "_id",
//     async find(_params?: Params): Promise<Array<any>> {
//       const sendRequestScope: SendRequestScope = {
//         appName: config.appName,
//         nats: nats,
//         app: app,
//         serviceName: serviceName,
//         methodName: ServiceMethods.Find,
//         request: { params: _params },
//       }

//       return sendRequest.call(sendRequestScope)
//     },

//     async get(id: Id, _params?: Params): Promise<Object> {
//       const sendRequestScope: SendRequestScope = {
//         appName: config.appName,
//         nats: nats,
//         app: app,
//         serviceName: serviceName,
//         methodName: ServiceMethods.Get,
//         request: { id: id, params: _params },
//       }

//       return sendRequest.call(sendRequestScope)
//     },

//     async create(data: Object | Array<any>, params?: Params): Promise<Object> {
//       if (Array.isArray(data)) {
//         return Promise.all(data.map(current => this.create(current, params)))
//       }

//       const sendRequestScope: SendRequestScope = {
//         appName: config.appName,
//         nats: nats,
//         app: app,
//         serviceName: serviceName,
//         methodName: ServiceMethods.Create,
//         request: { data: data, params: params },
//       }

//       return sendRequest.call(sendRequestScope)
//     },

//     async update(
//       id: NullableId,
//       data: Object | Array<any>,
//       _params?: Params
//     ): Promise<Object> {
//       const sendRequestScope: SendRequestScope = {
//         appName: config.appName,
//         nats: nats,
//         app: app,
//         serviceName: serviceName,
//         methodName: ServiceMethods.Update,
//         request: { id: id, data: data, params: _params },
//       }

//       return sendRequest.call(sendRequestScope)
//     },

//     async patch(
//       id: NullableId,
//       data: Object | Array<any>,
//       _params?: Params
//     ): Promise<Object> {
//       const sendRequestScope: SendRequestScope = {
//         appName: config.appName,
//         nats: nats,
//         app: app,
//         serviceName: serviceName,
//         methodName: ServiceMethods.Patch,
//         request: { id: id, data: data, params: _params },
//       }

//       return sendRequest.call(sendRequestScope)
//     },

//     async remove(id: NullableId, _params?: Params): Promise<Object> {
//       const sendRequestScope: SendRequestScope = {
//         appName: config.appName,
//         nats: nats,
//         app: app,
//         serviceName: serviceName,
//         methodName: ServiceMethods.Remove,
//         request: { id: id, params: _params },
//       }

//       return sendRequest.call(sendRequestScope)
//     },
//   }
// }

export const getOptions = (app: any) => {
  return { app }
}
