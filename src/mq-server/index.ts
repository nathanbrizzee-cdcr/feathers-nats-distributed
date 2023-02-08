import Debug from "debug"
const debug = Debug("feathers-nats-distributed:server:index")
import { BadRequest } from "@feathersjs/errors"
import { getInstance, NatsConnection, ConnectionOptions } from "../instance"

import responses from "./response-handler"

let nats: NatsConnection

export type ServerInitConfig = {
  appName: string
  natsConfig: ConnectionOptions
}
export type ServerInstance = (config: ServerInitConfig) => (this: any) => void

export type ServerInstanceCallback = (this: any) => any

const Server = function (config: ServerInitConfig): ServerInstance {
  getInstance(config.natsConfig).then(natsConn => {
    nats = natsConn
  })

  return function mqserver(this: any): ServerInstanceCallback {
    const app: any = this as any
    app.set("natsInstance", nats)

    // if (!app.get("name")) {
    //   throw new BadRequest("App name (app.name) is required ")
    // }
    try {
      const conns = []
      const resp = new responses(app, config.appName, nats)
      conns.push(resp.createService("find", ""))
      conns.push(resp.createService("get", ""))
      conns.push(resp.createService("create", ""))
      conns.push(resp.createService("patch", ""))
      conns.push(resp.createService("update", ""))
      conns.push(resp.createService("remove", ""))
    } catch (e: any) {
      throw new BadRequest(
        e.message,
        "An error occurred creating NATS service subscribers"
      )
    }
    //app.nats = nats
    // app.mq = {
    //   subs: nats.subs,
    // };
    return this
  }
}

export { Server }
