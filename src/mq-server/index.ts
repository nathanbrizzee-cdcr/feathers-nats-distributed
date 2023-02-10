import Debug from "debug"
const debug = Debug("feathers-nats-distributed:mq-server:index")
import { BadRequest } from "@feathersjs/errors"
import { getInstance, NatsConnection, ConnectionOptions } from "../instance"

import responses from "./response-handler"

let nats: NatsConnection

export type ServerInitConfig = {
  appName: string
  natsConfig: ConnectionOptions
}
//export type ServerInstance = (config: ServerInitConfig) => (this: any) => void

//export type ServerInstanceCallback = (this: any) => any

// configure(callback: (this: this, app: this) => void): this;

const Server = function (config: ServerInitConfig): (this: any) => void {
  return function mqserver(this: any): void {
    const app: any = this as any

    async function main() {
      if (!config.appName) {
        throw new BadRequest("appName (the name of this server) is required ")
      }

      nats = await getInstance(config.natsConfig)
      app.set("natsInstance", nats)

      try {
        const conns = []
        const resp = new responses(app, config.appName, nats)
        conns.push(resp.createService("find"))
        conns.push(resp.createService("get"))
        conns.push(resp.createService("create"))
        conns.push(resp.createService("patch"))
        conns.push(resp.createService("update"))
        conns.push(resp.createService("remove"))
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
