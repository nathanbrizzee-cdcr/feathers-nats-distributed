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

export type BaseConfig = {
  /**The name of this server. Usually package.json.name */
  appName: string
  /**The version of this server.  Usually package.json.version */
  appVersion: string
  /** A unique identifer for this instance of this server.  Will default to a short UUID  */
  appInstanceID?: string
  /**A NATS connection object */
  natsConfig: ConnectionOptions
}
export type BaseServerConfig = {
  /** Configuration for a server to publish a list of its services */
  servicePublisher?: {
    /**
     * Whether or not to publish all registered services in this server over NATS. Default is false .
     * Only applies to servers
     */
    publishServices: boolean
    /**
     * For servers, this is a list of private services to not publish. Note publishServices flag must be enabled.
     * Full service names are expected (without the action ie. create, patch, put, etc.)
     * Typically you might want to exclude the "authentication" service that exists in each server
     * @example
     *  authentication
     *  internal/users
     *  api/private/my-custom-svc
     *  config/super-secret
     *  users
     */
    servicesIgnoreList?: string[]
    /** number of miliseconds to wait between broadcast events. Don't make this number too small or
     * you will overwhelm the system with events.
     * The system will wait between 5 and 10 seconds before it starts broadcating - if enabled
     * @default 60000
     * @minimum 1000
     */
    publishDelay: number
  }
}
export type BaseClientConfig = {
  circuitBreakerConfig?: {
    /** whether the circuit breaker is enabled or not
     * @default false
     */
    enabled?: boolean
    /**
     * Number of ms for the circuit breaker to wait before failing a call.
     * Note: The Nats service timeout will be set to this amount plus 50 ms
     * @default 5000 ms
     */
    requestTimeout?: number
    /**
     * Number of ms to wait before reseting the circuit breaker retry logic
     * Note: This number should be a bit larger than
     * @default 30000 ms
     */
    resetTimeout?: number
    /**
     * Percentage of requests if failed will trip the circuit breaker
     * Valid values are 0 to 100.
     * @default 50 percent
     */
    errorThresholdPercentage?: number
  }
}
export type ServerConfig = BaseConfig & BaseServerConfig
export type ClientConfig = BaseConfig & BaseClientConfig

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
  Service = "servicecall",
  Event = "event",
  ServiceList = "servicelist",
}

export enum ServiceEventTypes {
  Created = "created",
  Updated = "updated",
  Patched = "patched",
  Removed = "removed",
}

export type ServerInfo = {
  name: string
  version: string
  id: string
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
  serverInfo: ServerInfo
  config: ClientConfig
  serviceName: string
  methodName: ServiceMethods
  request: RequestParams
}

export type Reply = {
  data?: Object | Array<any>
  error?: FeathersError
  headers?: MsgHdrs
  serverInfo?: ServerInfo
}
