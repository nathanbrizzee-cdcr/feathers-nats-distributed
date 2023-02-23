"use strict"
import Debug from "debug"
const debug = Debug("feathers-nats-distributed:client:index")
import { BadRequest } from "@feathersjs/errors"
import ShortUniqueId from "short-unique-id"
import { getInstance, NatsConnection } from "../instance"
import { sanitizeAppName } from "../common/helpers"
import { ClientConfig } from "../common/types"
import { NatsService } from "./service"
export { NatsService }

let nats: NatsConnection

const Client = function (config: ClientConfig): (this: any) => void {
  return function mqclient(this: any): void {
    const app: any = this as any

    async function main() {
      if (!config.appName) {
        throw new BadRequest("appName (the name of this server) is required ")
      }
      // Clean up the appname for NATS
      config.appName = sanitizeAppName(config.appName)
      nats = await getInstance(config.natsConfig)
      if (!app.get("NatsInstance")) {
        app.set("NatsInstance", nats)
      }
      if (!config.appInstanceID) {
        const uid = new ShortUniqueId({ length: 10 })
        config.appInstanceID = uid()
      }
      debug(`Client: ${JSON.stringify(config)} is starting up`)
      try {
        const svc = new NatsService(app, nats, config)
        if (!app.get("NatsService")) {
          app.set("NatsService", svc)
        }
      } catch (e) {
        throw new BadRequest("An error occurred creating NATS Service", e)
      }
    }
    main()
    return this
  }
}

export { Client }
