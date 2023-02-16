"use strict"
import Debug from "debug"
const debug = Debug("feathers-mq:client:service")
import { BadRequest, MethodNotAllowed, NotFound } from "@feathersjs/errors"
import type { Id, NullableId, Params } from "@feathersjs/feathers"
import { getInstance, NatsConnection } from "../instance"
import {
  InitConfig,
  ServiceActions,
  SendRequestScope,
  ServiceMethods,
} from "../common/types"

const sendRequest = require("./send-request")

export class NatsService {
  app: any
  /**
   * Feathers Path variable - which is the service name
   */
  serviceName: string
  nats: NatsConnection
  config: InitConfig

  constructor(
    app: any,
    serviceName: string,
    nats: NatsConnection,
    config: InitConfig
  ) {
    this.app = app
    this.serviceName = serviceName
    this.nats = nats
    this.config = config
  }

  async find(_params?: Params): Promise<Array<any>> {
    const sendRequestScope: SendRequestScope = {
      appName: this.config.appName,
      nats: this.nats,
      app: this.app,
      serviceName: this.serviceName,
      methodName: ServiceMethods.Find,
      request: { params: _params },
    }

    return sendRequest.call(sendRequestScope)
  }

  async get(id: Id, _params?: Params): Promise<Object> {
    const sendRequestScope: SendRequestScope = {
      appName: this.config.appName,
      nats: this.nats,
      app: this.app,
      serviceName: this.serviceName,
      methodName: ServiceMethods.Get,
      request: { id: id, params: _params },
    }

    return sendRequest.call(sendRequestScope)
  }

  async create(data: Object | Array<any>, params?: Params): Promise<Object> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)))
    }

    const sendRequestScope: SendRequestScope = {
      appName: this.config.appName,
      nats: this.nats,
      app: this.app,
      serviceName: this.serviceName,
      methodName: ServiceMethods.Create,
      request: { data: data, params: params },
    }

    return sendRequest.call(sendRequestScope)
  }

  async update(
    id: NullableId,
    data: Object | Array<any>,
    _params?: Params
  ): Promise<Object> {
    const sendRequestScope: SendRequestScope = {
      appName: this.config.appName,
      nats: this.nats,
      app: this.app,
      serviceName: this.serviceName,
      methodName: ServiceMethods.Update,
      request: { id: id, data: data, params: _params },
    }

    return sendRequest.call(sendRequestScope)
  }

  async patch(
    id: NullableId,
    data: Object | Array<any>,
    _params?: Params
  ): Promise<Object> {
    const sendRequestScope: SendRequestScope = {
      appName: this.config.appName,
      nats: this.nats,
      app: this.app,
      serviceName: this.serviceName,
      methodName: ServiceMethods.Patch,
      request: { id: id, data: data, params: _params },
    }

    return sendRequest.call(sendRequestScope)
  }

  async remove(id: NullableId, _params?: Params): Promise<Object> {
    const sendRequestScope: SendRequestScope = {
      appName: this.config.appName,
      nats: this.nats,
      app: this.app,
      serviceName: this.serviceName,
      methodName: ServiceMethods.Remove,
      request: { id: id, params: _params },
    }

    return sendRequest.call(sendRequestScope)
  }
}

export const getOptions = (app: any) => {
  return { app }
}
