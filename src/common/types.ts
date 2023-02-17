"use strict"
import {
  connect,
  NatsConnection,
  ConnectionOptions,
  Status,
  Events,
  MsgHdrs,
} from "nats"
import type { NullableId, Params } from "@feathersjs/feathers"
import { FeathersError } from "@feathersjs/errors"

export type InitConfig = {
  appName: string
  natsConfig: ConnectionOptions
}

export type ServiceActions = {
  serverName: string
  servicePath: string
  methodName: ServiceMethods
  serviceType: ServiceTypes
}

export enum ServiceMethods {
  Find = "find",
  Get = "get",
  Create = "create",
  Update = "update",
  Patch = "patch",
  Remove = "remove",
  Unknown = "",
}

export enum ServiceTypes {
  Unknown = "",
  Service = "service",
  Event = "event",
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

export type Reply = {
  data?: Object | Array<any>
  error?: FeathersError
  headers?: MsgHdrs
}
