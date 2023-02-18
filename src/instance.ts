import { GeneralError } from "@feathersjs/errors/lib"
import Debug from "debug"
const debug = Debug("feathers-nats-distributed:instance")
import {
  connect,
  NatsConnection,
  ConnectionOptions,
  Codec,
  JSONCodec,
  StringCodec,
  Events,
} from "nats"
import { InitConfig, ServiceActions } from "./common/types"

const jsonCodec: Codec<unknown> = JSONCodec()
const stringCodec: Codec<string> = StringCodec()

let instance: NatsConnection

/**
 * Opens and connects to a NATS server.  If a connection is already established, it returns the existing connection
 * @param natsConfig NATS configuration option. If no parameters are passed, localhost:4222 is assumed
 * @returns NATS connection to a NATS server
 */
const getInstance = async function (
  natsConfig: ConnectionOptions = {}
): Promise<NatsConnection> {
  let conn: ConnectionOptions = {}
  Object.assign(
    conn,
    {
      servers: "localhost:4222",
    },
    natsConfig
  )
  if (!instance || instance.isClosed()) {
    try {
      debug("Connecting to NATS with ", conn)
      try {
        instance = await connect(conn)
        debug("NATS server info:", instance.info)
      } catch (err) {
        // @ts-expect-error
        instance = null
        debug(err)
        throw new GeneralError("NATS connection exited because of error:", err)
      }

      // This is only called if the application calls close on the connection
      // If the connection closes due to the server going away, this is not called
      instance.closed().then(err => {
        if (err) {
          debug(`NATS connection exited because of error: ${err.message}`)
          throw new GeneralError(
            "NATS connection exited because of error:",
            err.message
          )
        } else {
          debug("NATS connection closed")
          throw new GeneralError("NATS connection closed")
        }
      })
      // Monitor the NATS instance for status changes
      ;(async () => {
        for await (const s of instance.status()) {
          // debug(`NATS instance status change ${JSON.stringify(s, null, 2)}`)
          // Not positive we want to throw an error when the NATS server gets an error
          // Not sure if that means the server is no longer able to respond or if we can
          // keep talking to it.
          // If we die, then all servers could die at once causing a massive outage.
          if (s.type === Events.Error) {
            // debug(`NATS instance status change ${JSON.stringify(s, null, 2)}`)
            throw new GeneralError("NATS server encountered an error", s)
          }
        }
        debug("NATS status monitoring closed")
      })()

      return instance
    } catch (e) {
      debug("Unable to connect to NATS")
      debug(e)
      throw e
    }
  }

  return instance
}

/**
 * Drains and closes a NATS connection instance
 */
const closeInstance = async function (): Promise<void> {
  if (instance && !instance.isDraining() && !instance.isClosed()) {
    try {
      debug("draining and closing NATS connection")
      await instance.drain()
    } catch (e) {
      throw e
    }
  }
  debug("NATS connection closed")
}

export {
  jsonCodec,
  stringCodec,
  getInstance,
  closeInstance,
  NatsConnection,
  ConnectionOptions,
  InitConfig,
  ServiceActions,
}
