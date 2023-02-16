"use strict"
import Debug from "debug"
const debug = Debug("feathers-nats-distributed:client:send-request")
import {
  BadRequest,
  MethodNotAllowed,
  NotFound,
  Unavailable,
  Timeout,
} from "@feathersjs/errors"
import type { Id, NullableId, Params } from "@feathersjs/feathers"
import { RequestOptions, NatsError, ErrorCode } from "nats"
import { Reply } from "../common/types"
import { sanitizeServiceName } from "../common/helpers"
import { jsonCodec, getInstance, NatsConnection } from "../instance"
import {
  InitConfig,
  ServiceActions,
  SendRequestScope,
  ServiceMethods,
} from "../common/types"

export async function sendRequest(
  sendRequestScope: SendRequestScope
): Promise<Reply> {
  const { appName, nats, serviceName, methodName, request } = sendRequestScope

  let newServicename = serviceName

  if (serviceName.startsWith("/")) {
    newServicename = serviceName.replace("/", "")
  }
  newServicename = sanitizeServiceName(newServicename)

  const subject = `service.${appName}.${newServicename}.${methodName}`
  debug(`triggered ${subject}`)

  const opts: RequestOptions = {
    timeout: 20000,
  }
  try {
    const response = await nats.request(
      subject,
      jsonCodec.encode(request),
      opts
    )
    if (response instanceof NatsError && response.code === ErrorCode.Timeout) {
      throw new BadRequest("Request timed out on feathers-mq.", {
        appName,
        newServicename,
        methodName,
      })
    }
    const decodedData: any = jsonCodec.decode(response.data)
    debug("Received reply %0", decodedData)

    const reply: Reply = {
      data: decodedData.data?.data,
      headers: decodedData?.headers,
      error: decodedData.data?.error,
    }
    if (reply.error) {
      debug(reply.error)
      throw new BadRequest(reply.error)
    }
    return reply
  } catch (err: any) {
    switch (err.code) {
      case ErrorCode.NoResponders:
        throw new Unavailable(`no one is listening to ${subject}`)
        break
      case ErrorCode.Timeout:
        throw new Timeout("someone is listening but didn't respond")
        break
      default:
        throw new BadRequest("request failed", err)
    }
  }
}
