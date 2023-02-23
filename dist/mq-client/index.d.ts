import { ClientConfig } from "../common/types";
import { NatsService } from "./service";
export { NatsService };
declare const Client: (config: ClientConfig) => (this: any) => void;
export { Client };
