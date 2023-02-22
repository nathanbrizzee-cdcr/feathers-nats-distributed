"use strict"
import Debug from "debug"
const debug = Debug("feathers-nats-distributed:server:index")
import { BadRequest } from "@feathersjs/errors"
import ShortUniqueId from "short-unique-id"
import { getInstance, NatsConnection, InitConfig } from "../instance"
import { sanitizeAppName } from "../common/helpers"
import { ServiceMethods } from "../common/types"
import responses from "./response-handler"

let nats: NatsConnection

const Server = function (config: InitConfig): (this: any) => void {
  return function mqserver(this: any): void {
    const app: any = this as any

    async function main() {
      if (!config.appName) {
        throw new BadRequest("appName (the name of this server) is required ")
      }
      // Clean up the appname for NATS
      config.appName = sanitizeAppName(config.appName)
      nats = await getInstance(config.natsConfig)
      if (!config.appInstanceID) {
        const uid = new ShortUniqueId({ length: 10 })
        config.appInstanceID = uid()
      }
      debug(`Server: ${JSON.stringify(config)} is starting up`)
      if (!app.get("NatsInstance")) {
        app.set("NatsInstance", nats)
      }

      try {
        const svcs = []
        const resp = new responses(app, config, nats)
        svcs.push(resp.createService(ServiceMethods.Find))
        svcs.push(resp.createService(ServiceMethods.Get))
        svcs.push(resp.createService(ServiceMethods.Create))
        svcs.push(resp.createService(ServiceMethods.Patch))
        svcs.push(resp.createService(ServiceMethods.Update))
        svcs.push(resp.createService(ServiceMethods.Remove))
        svcs.push(resp.startServicePublisher())
        Promise.all(svcs)
      } catch (e) {
        throw new BadRequest(
          "An error occurred creating NATS service subscribers",
          e
        )
      }
    }
    main()
    return this
  }
}

export { Server }
