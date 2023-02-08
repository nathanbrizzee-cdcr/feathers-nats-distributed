import { NatsConnection, ConnectionOptions } from "nats";
declare const getInstance: (natsConfig?: ConnectionOptions) => Promise<NatsConnection>;
declare const closeInstance: () => Promise<void>;
export { getInstance, closeInstance, NatsConnection, ConnectionOptions };
