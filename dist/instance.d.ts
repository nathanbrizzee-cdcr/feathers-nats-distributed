import { NatsConnection, ConnectionOptions, Codec } from "nats";
import { InitConfig, ServiceActions } from "./common/types";
declare const jsonCodec: Codec<unknown>;
declare const stringCodec: Codec<string>;
declare const getInstance: (natsConfig?: ConnectionOptions) => Promise<NatsConnection>;
declare const closeInstance: () => Promise<void>;
export { jsonCodec, stringCodec, getInstance, closeInstance, NatsConnection, ConnectionOptions, InitConfig, ServiceActions, };
