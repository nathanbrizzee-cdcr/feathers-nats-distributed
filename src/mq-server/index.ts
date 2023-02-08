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
    const resp = new responses(app, appName, nats)
    const findSvc = await resp.createService("find", "")
    const getSvc = await resp.createService("get", "")
    const createSvc = await resp.createService("create", "")
    const patchSvc = await resp.createService("patch", "")
    const updateSvc = await resp.createService("update", "")
    const removeSvc = await resp.createService("remove", "")

    //app.nats = nats
    // app.mq = {
    //   subs: nats.subs,
    // };
  }
}

export { MQServer }
