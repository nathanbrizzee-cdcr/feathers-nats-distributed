import Debug from "debug"
const debug = Debug("feathers-nats-distributed:server:index")
import { BadRequest } from "@feathersjs/errors"
import { getInstance, NatsConnection, ConnectionOptions } from "../instance"

import responses from "./response-handler"

let nats: NatsConnection

const MQServer = async function MQServer(
  appName: string,
  natsConfig: ConnectionOptions
): Promise<(this: any) => void> {
  nats = await getInstance(natsConfig)

  return async function mqserver(this: any): Promise<void> {
    const app: any = this as any
    app.set("natsInstance", nats)

    // if (!app.get("name")) {
    //   throw new BadRequest("App name (app.name) is required ")
    // }
    try {
      const conns = []
      const resp = new responses(app, appName, nats)
      conns.push(resp.createService("find", ""))
      conns.push(resp.createService("get", ""))
      conns.push(resp.createService("create", ""))
      conns.push(resp.createService("patch", ""))
      conns.push(resp.createService("update", ""))
      conns.push(resp.createService("remove", ""))

      await Promise.all(conns)
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
  }
}

export { MQServer }
