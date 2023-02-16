"use strict"
import Debug from "debug"
const debug = Debug("feathers-nats-distributed:client:index")
import { BadRequest } from "@feathersjs/errors"
import { getInstance, NatsConnection, InitConfig } from "../instance"
import { NatsService } from "./service"

let nats: NatsConnection

const Client = function (config: InitConfig): (this: any) => void {
  return function attachService(this: any): void {
    const app: any = this as any

    async function main() {
      if (!config.appName) {
        throw new BadRequest("appName (the name of this client) is required ")
      }

      nats = await getInstance(config.natsConfig)
      app.set("natsInstance", nats)
      app.defaultService = function (path: string) {
        return new NatsService(app, path, nats, config)
      }
      debug("Finished configuring defaultService")
    }

    main()
    return this
  }
}

export { Client }
