"use strict"
import Debug from "debug"
const debug = Debug("feathers-nats-distributed:client:service")
import { BadRequest, MethodNotAllowed, NotFound } from "@feathersjs/errors"
import type { Id, NullableId, Params } from "@feathersjs/feathers"
import { FeathersKoaContext } from "@feathersjs/koa"
import { getInstance, NatsConnection } from "../instance"
import {
  ClientConfig,
  SendRequestScope,
  ServiceMethods,
  Reply,
  ServerInfo,
} from "../common/types"

const { sendRequest } = require("./send-request")

export class NatsService {
  app: any
  nats: NatsConnection
  config: ClientConfig
  serverInfo: ServerInfo

  constructor(app: any, nats: NatsConnection, config: ClientConfig) {
    this.app = app
    this.nats = nats
    this.config = config
    this.serverInfo = {
      name: this.config.appName,
      version: this.config.appVersion,
      id: this.config.appInstanceID as string,
    }
  }

  async find(
    serverName: string,
    serviceName: string,
    _params?: Params
  ): Promise<Array<any> | Object | undefined> {
    const sendRequestScope: SendRequestScope = {
      appName: serverName,
      nats: this.nats,
      app: this.app,
      serverInfo: this.serverInfo,
      config: this.config,
      serviceName: serviceName,
      methodName: ServiceMethods.Find,
      request: {
        params: {
          query: _params?.query,
          provider: _params?.provider,
          route: _params?.route,
          headers: _params?.headers,
        },
      },
    }
    const reply: Reply = await sendRequest(sendRequestScope)
    return reply.data
  }

  async get(
    serverName: string,
    serviceName: string,
    id: Id,
    _params?: Params
  ): Promise<Object | undefined> {
    const sendRequestScope: SendRequestScope = {
      appName: serverName,
      nats: this.nats,
      app: this.app,
      serverInfo: this.serverInfo,
      config: this.config,
      serviceName: serviceName,
      methodName: ServiceMethods.Get,
      request: {
        id: id,
        params: {
          query: _params?.query,
          provider: _params?.provider,
          route: _params?.route,
          headers: _params?.headers,
        },
      },
    }

    const reply: Reply = await sendRequest(sendRequestScope)
    return reply.data
  }

  async create(
    serverName: string,
    serviceName: string,
    data: Object | Array<any>,
    params?: Params
  ): Promise<Object | undefined> {
    if (Array.isArray(data)) {
      return Promise.all(
        data.map(current =>
          this.create(serverName, serviceName, current, params)
        )
      )
    }

    const sendRequestScope: SendRequestScope = {
      appName: serverName,
      nats: this.nats,
      app: this.app,
      serverInfo: this.serverInfo,
      config: this.config,
      serviceName: serviceName,
      methodName: ServiceMethods.Create,
      request: {
        data: data,
        params: {
          query: params?.query,
          provider: params?.provider,
          route: params?.route,
          headers: params?.headers,
        },
      },
    }

    const reply: Reply = await sendRequest(sendRequestScope)
    return reply.data
  }

  async update(
    serverName: string,
    serviceName: string,
    id: NullableId,
    data: Object | Array<any>,
    _params?: Params
  ): Promise<Object | undefined> {
    const sendRequestScope: SendRequestScope = {
      appName: serverName,
      nats: this.nats,
      app: this.app,
      serverInfo: this.serverInfo,
      config: this.config,
      serviceName: serviceName,
      methodName: ServiceMethods.Update,
      request: {
        id: id,
        data: data,
        params: {
          query: _params?.query,
          provider: _params?.provider,
          route: _params?.route,
          headers: _params?.headers,
        },
      },
    }

    const reply: Reply = await sendRequest(sendRequestScope)
    return reply.data
  }

  async patch(
    serverName: string,
    serviceName: string,
    id: NullableId,
    data: Object | Array<any>,
    _params?: Params
  ): Promise<Object | undefined> {
    const sendRequestScope: SendRequestScope = {
      appName: serverName,
      nats: this.nats,
      app: this.app,
      serverInfo: this.serverInfo,
      config: this.config,
      serviceName: serviceName,
      methodName: ServiceMethods.Patch,
      request: {
        id: id,
        data: data,
        params: {
          query: _params?.query,
          provider: _params?.provider,
          route: _params?.route,
          headers: _params?.headers,
        },
      },
    }

    const reply: Reply = await sendRequest(sendRequestScope)
    return reply.data
  }

  async remove(
    serverName: string,
    serviceName: string,
    id: NullableId,
    _params?: Params
  ): Promise<Object | undefined> {
    const sendRequestScope: SendRequestScope = {
      appName: serverName,
      nats: this.nats,
      app: this.app,
      serverInfo: this.serverInfo,
      config: this.config,
      serviceName: serviceName,
      methodName: ServiceMethods.Remove,
      request: {
        id: id,
        params: {
          query: _params?.query,
          provider: _params?.provider,
          route: _params?.route,
          headers: _params?.headers,
        },
      },
    }

    const reply: Reply = await sendRequest(sendRequestScope)
    return reply.data
  }
}
