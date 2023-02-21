"use strict"
import Debug from "debug"
const debug = Debug("feathers-nats-distributed:client:send-request")
import {
  BadRequest,
  MethodNotAllowed,
  NotFound,
  Unavailable,
  Timeout,
  FeathersError,
} from "@feathersjs/errors"
import type { Id, NullableId, Params } from "@feathersjs/feathers"
import { RequestOptions, NatsError, ErrorCode } from "nats"

import { sanitizeServiceName, makeNatsSubjectName } from "../common/helpers"
import { jsonCodec, getInstance, NatsConnection } from "../instance"
import {
  Reply,
  InitConfig,
  ServiceActions,
  SendRequestScope,
  ServiceMethods,
  ServiceTypes,
} from "../common/types"

export async function sendRequest(
  sendRequestScope: SendRequestScope
): Promise<Reply> {
  const { nats, request } = sendRequestScope

  const serviceActions: ServiceActions = {
    servicePath: sendRequestScope.serviceName,
    serverName: sendRequestScope.appName,
    methodName: sendRequestScope.methodName,
    serviceType: ServiceTypes.Service,
  }
  const subject = makeNatsSubjectName(serviceActions)
  debug(`Sending Request to NATS queue ${subject}`)

  const opts: RequestOptions = {
    timeout: 20000,
  }
  try {
    if (nats && !nats.isDraining() && !nats.isClosed()) {
      const response = await nats.request(
        subject,
        jsonCodec.encode(request),
        opts
      )
      if (
        response instanceof NatsError &&
        response.code === ErrorCode.Timeout
      ) {
        throw new BadRequest(
          "Request timed out on feathers-nats-distributed.",
          serviceActions
        )
      }
      const decodedData: any = jsonCodec.decode(response.data)
      // debug(`Received reply ${decodedData}`)

      const reply: Reply = {
        data: decodedData.data,
        headers: decodedData.headers,
        error: decodedData.error,
      }
      if (reply.error) {
        debug(reply.error)
        throw new FeathersError(
          reply.error.message,
          reply.error.name,
          reply.error.code,
          reply.error.className,
          {}
        )
      }
      return reply
    } else {
      debug("NATS is draining or is closed.")
      const reply: Reply = {
        data: undefined,
        headers: undefined,
        error: new BadRequest("NATS server is draining or closed"),
      }
      return reply
    }
  } catch (err: any) {
    switch (err.code) {
      case ErrorCode.NoResponders:
        throw new Unavailable(`no one is listening to ${subject}`)
      case ErrorCode.Timeout:
        throw new Timeout("someone is listening but didn't respond")
      default:
        throw err
    }
  }
}
