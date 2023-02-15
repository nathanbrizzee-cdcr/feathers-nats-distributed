"use strict"
const debug = require("debug")("feathers-mq:client:service")
import { BadRequest, MethodNotAllowed, NotFound } from "@feathersjs/errors"
import type { Id, NullableId, Params } from "@feathersjs/feathers"
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
      nats
        .request(subject, jsonCodec.encode(request))
        .then(response => {})
        .catch(e => {})

      nats.requestOne(
        `${serviceName}.${methodName}`,
        payload,
        {},
        configuration.timeout,
        response => {
          if (
            response instanceof NATS.NatsError &&
            response.code === NATS.REQ_TIMEOUT
          ) {
            return reject(
              new Errors.Timeout("Request timed out on feathers-mq.", {
                appName,
                serviceName,
                methodName,
              })
            )
          }
          debug("Got response %O", response)

          if (response) {
            if (response.__mqError) {
              //eslint-disable-line
              return reject(response.__mqError) //eslint-disable-line
            }

            if (response.errors) {
              return reject(response)
            }
          }

          return resolve(response)
        }
      )
    } catch (e) {
      reject(e)
    }
  })
}
