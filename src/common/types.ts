"use strict"
import {
  connect,
  NatsConnection,
  ConnectionOptions,
  Status,
  Events,
} from "nats"
import type { Id, NullableId, Params } from "@feathersjs/feathers"

export type InitConfig = {
  appName: string
  natsConfig: ConnectionOptions
}

export type ServiceActions = {
  serverName: string
  serviceName: string
  methodName: string
}

export enum ServiceMethods {
  Find = "find",
  Get = "get",
  Create = "create",
  Update = "update",
  Patch = "patch",
  Remove = "remove",
}

export type RequestParams = {
  id?: NullableId
  params?: Params
  data?: Object | Array<any>
}

export type SendRequestScope = {
  appName: string
  nats: NatsConnection
  app: any
  serviceName: string
  methodName: ServiceMethods
  request: RequestParams
}
