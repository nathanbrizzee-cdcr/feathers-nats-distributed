"use strict"
import Debug from "debug"
const debug = Debug("feathers-nats-distributed:client:send-request")
import {
  BadRequest,
  Unavailable,
  Timeout,
  FeathersError,
} from "@feathersjs/errors"
import { RequestOptions, NatsError, ErrorCode, NatsConnection } from "nats"
import CircuitBreaker from "opossum"
import { makeNatsSubjectName } from "../common/helpers"
import { jsonCodec } from "../instance"
import {
  Reply,
  ServiceActions,
  SendRequestScope,
  ServiceTypes,
} from "../common/types"

const sendGetRequest = async function (
  nats: NatsConnection,
  subject: string,
  jsonMsg: any,
  opts: any
): Promise<any> {
  return await nats.request(subject, jsonMsg, opts)
}
let breaker: any = null

export async function sendRequest(
  sendRequestScope: SendRequestScope
): Promise<Reply> {
  const { nats, request, serverInfo, config } = sendRequestScope

  const serviceActions: ServiceActions = {
    servicePath: sendRequestScope.serviceName,
    serverName: sendRequestScope.appName,
    methodName: sendRequestScope.methodName,
    serviceType: ServiceTypes.Service,
  }
  const subject = makeNatsSubjectName(serviceActions)
  debug(`Sending Request to NATS queue ${subject}`)

  const circuitBreakerOptions = {
    timeout: config.circuitBreakerConfig?.requestTimeout || 5000, // If our function takes longer than XX seconds, trigger a failure
    errorThresholdPercentage:
      config.circuitBreakerConfig?.errorThresholdPercentage || 50, // When XX% of requests fail, trip the circuit
    resetTimeout: config.circuitBreakerConfig?.resetTimeout || 30000, // After XX seconds, try again.
  }
  const opts: RequestOptions = {
    timeout: circuitBreakerOptions.timeout + 50,
  }

  try {
    if (nats && !nats.isDraining() && !nats.isClosed()) {
      const jsonMsg = jsonCodec.encode({ request, serverInfo })
      // Create the breaker only once and use an instance of it so we can
      // keep track of all its statistics
      if (!breaker) {
        debug(
          `Initializing circuit breaker with ${JSON.stringify(
            circuitBreakerOptions
          )}`
        )
        breaker = new CircuitBreaker(sendGetRequest, circuitBreakerOptions)
        if (config.circuitBreakerConfig?.enabled === true) {
          breaker.enable()
        } else {
          breaker.disable()
        }
      }
      let response: any = null
      try {
        response = await breaker.fire(nats, subject, jsonMsg, opts)
      } catch (e) {
        const stats = breaker.stats
        const errorRate =
          ((stats.failures || stats.rejects) / stats.fires) * 100
        debug(
          `Circuit Breaker Error Stats with an error rate of ${errorRate}%:\n${JSON.stringify(
            stats,
            null,
            2
          )}`
        )
        throw e
      }
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
      debug(`Received reply ${JSON.stringify(decodedData)}`)

      const reply: Reply = {
        data: decodedData.data,
        headers: decodedData.headers,
        error: decodedData.error,
        serverInfo: decodedData.serverInfo,
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
        error: new BadRequest("NATS server is draining or closed"),
      }
      return reply
    }
  } catch (err: any) {
    // debug(err)
    switch (err.code) {
      case ErrorCode.NoResponders:
        //throw new Unavailable(`no one is listening to ${subject}`)
        throw new Unavailable(`No listeners subscribed to ${subject}`)
      case ErrorCode.Timeout:
        //throw new Timeout("someone is listening but didn't respond")
        throw new Timeout(`NATS service call timed out. ${err.message}`)
      case "ETIMEDOUT":
        throw new Timeout(`Circuit breaker timeout. ${err.message}`)
      default:
        throw new Unavailable(err.message)
      //throw err
    }
  }
}
