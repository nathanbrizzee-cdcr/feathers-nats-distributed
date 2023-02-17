import { InitConfig } from "../instance";
import { NatsService } from "./service";
export { NatsService };
declare const Client: (config: InitConfig) => (this: any) => void;
export { Client };
