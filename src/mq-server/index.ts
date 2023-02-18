"use strict"
import Debug from "debug"
// const debug = Debug("feathers-nats-distributed:server:index")
import { BadRequest } from "@feathersjs/errors"
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
      if (!app.get("NatsInstance")) {
        app.set("NatsInstance", nats)
      }

      try {
        const conns = []
        const resp = new responses(app, config.appName, nats)
        conns.push(resp.createService(ServiceMethods.Find))
        conns.push(resp.createService(ServiceMethods.Get))
        conns.push(resp.createService(ServiceMethods.Create))
        conns.push(resp.createService(ServiceMethods.Patch))
        conns.push(resp.createService(ServiceMethods.Update))
        conns.push(resp.createService(ServiceMethods.Remove))
        Promise.all(conns)
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
