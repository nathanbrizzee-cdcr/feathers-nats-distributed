"use strict"
import Debug from "debug"
const debug = Debug("feathers-nats-distributed:client:index")
import { BadRequest, NotFound, FeathersError } from "@feathersjs/errors"
import { FeathersKoaContext } from "@feathersjs/koa"
import { getInstance, NatsConnection, InitConfig } from "../instance"
import { sanitizeAppName } from "../common/helpers"
import { ServiceMethods } from "../common/types"
import { NatsService } from "./service"

let nats: NatsConnection

// const Client = function (config: InitConfig): (this: any) => void {
//   return function attachService(this: any): void {
//     const app: any = this as any

//     async function main() {
//       if (!config.appName) {
//         throw new BadRequest("appName (the name of this client) is required ")
//       }

//       nats = await getInstance(config.natsConfig)
//       app.set("natsInstance", nats)
//       app.defaultService = function (path: string) {
//         return new NatsService(app, path, nats, config)
//       }
//       debug("Finished configuring defaultService")
//     }

//     main()
//     return this
//   }
// }
const Client = function (config: InitConfig) {
  return async (
    ctx: FeathersKoaContext,
    next: () => Promise<any>
  ): Promise<void> => {
    const app: any = ctx.app
    try {
      if (!config.appName) {
        throw new BadRequest("appName (the name of this client) is required ")
      }
      config.appName = sanitizeAppName(config.appName)
      nats = await getInstance(config.natsConfig)
      app.set("natsInstance", nats)
      // app.defaultService = function (path: string) {
      const svc = new NatsService(app, ctx.path, nats, config)
      ctx.body = await svc.find(ctx.query)

      await next()
    } catch (error: any) {
      ctx.response.status = error instanceof FeathersError ? error.code : 500
      ctx.body =
        typeof error.toJSON === "function"
          ? error.toJSON()
          : {
              message: error.message,
            }
    }
  }
}
// const Client = function getFn(config: InitConfig) {
//   return function attachService() {
//     // @ts-expect-error
//     const app: any = this as any

//     async function main() {
//       if (!config.appName) {
//         throw new BadRequest("appName (the name of this client) is required ")
//       }
//       // Clean up the appname for NATS
//       config.appName = sanitizeAppName(config.appName)
//       nats = await getInstance(config.natsConfig)
//       app.set("natsInstance", nats)

//       debug(`Connected to NATS as Client : ${config.appName}.*`)

//       app.service = natsService.bind({ nats, app, config })
//     }

//     main()
//   }
// }
export { Client }
