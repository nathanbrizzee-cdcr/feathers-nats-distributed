"use strict"
import Debug from "debug"
const debug = Debug("feathers-mq:client:send-request")
import { BadRequest, MethodNotAllowed, NotFound } from "@feathersjs/errors"
import type { Id, NullableId, Params } from "@feathersjs/feathers"
import { RequestOptions, NatsError, ErrorCode } from "nats"
import { Reply } from "../common/types"
import { jsonCodec, getInstance, NatsConnection } from "../instance"
import {
  InitConfig,
  ServiceActions,
  SendRequestScope,
  ServiceMethods,
} from "../common/types"

export default function sendRequest(
  sendRequestScope: SendRequestScope
): Promise<unknown> {
  const { appName, nats, app, serviceName, methodName, request } =
    sendRequestScope

  const subject = `service.${appName}.${serviceName}.${methodName}`
  debug(`triggered ${subject}`)

  return new Promise(async (resolve, reject) => {
    try {
      const opts: RequestOptions = {
        timeout: 20000,
      }
      nats
        .request(subject, jsonCodec.encode(request), opts)
        .then(response => {
          if (
            response instanceof NatsError &&
            response.code === ErrorCode.Timeout
          ) {
            return reject(
              new BadRequest("Request timed out on feathers-mq.", {
                appName,
                serviceName,
                methodName,
              })
            )
          }
          const decodedData: any = jsonCodec.decode(response.data)
          debug("Received reply %0", decodedData)

          const reply: Reply = {
            data: decodedData.data?.data,
            headers: decodedData?.headers,
            error: decodedData.data?.error,
          }
          if (reply.error) {
            return reject(response)
          }

          return resolve(reply)
        })
        .catch(e => {
          debug("a nats error occurred ", e)
          reject(e.message)
        })
    } catch (e: any) {
      debug("an error occurred ", e)
      reject(e.message)
    }
  })
}
