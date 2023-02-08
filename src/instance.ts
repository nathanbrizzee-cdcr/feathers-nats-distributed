import Debug from "debug"
const debug = Debug("feathers-nats-distributed:instance")
import { connect, NatsConnection, ConnectionOptions } from "nats"

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
  Object.assign(conn, natsConfig, {
    servers: "localhost:4222",
  })
  if (!instance || instance.isClosed()) {
    try {
      debug("Connecting to NATS with connection", conn)
      instance = await connect(conn)
      instance.closed().then(err => {
        if (err) {
          console.error(
            `NATS connection exited because of error: ${err.message}`
          )
        }
      })

      // @ts-expect-error
      instance.on("connect", () => {
        debug("Connected to NATS as Server")
      })

      // @ts-expect-error
      instance.on("error", err => {
        debug("nats connection errored", err)
      })

      // @ts-expect-error
      instance.on("disconnect", () => {
        debug("nats connection disconnected")
      })

      // @ts-expect-error
      instance.on("close", () => {
        debug("nats connection closed")
      })

      // @ts-expect-error
      instance.on("timeout", () => {
        debug("nats connection timeout")
      })

      debug("Connected to NATS server")
      return instance
    } catch (e) {
      throw e
    }
  }
  debug("returning NATS instance")
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

export { getInstance, closeInstance, NatsConnection, ConnectionOptions }
