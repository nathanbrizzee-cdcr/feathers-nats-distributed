import { FeathersKoaContext } from "@feathersjs/koa";
import { InitConfig } from "../instance";
declare const Client: (config: InitConfig) => (ctx: FeathersKoaContext, next: () => Promise<any>) => Promise<void>;
export { Client };
