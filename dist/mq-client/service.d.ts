import type { Id, NullableId, Params } from "@feathersjs/feathers";
import { NatsConnection } from "../instance";
import { InitConfig } from "../common/types";
export declare class NatsService {
    app: any;
    nats: NatsConnection;
    config: InitConfig;
    constructor(app: any, nats: NatsConnection, config: InitConfig);
    find(appName: string, serviceName: string, _params?: Params): Promise<Array<any> | Object | undefined>;
    get(serviceName: string, id: Id, _params?: Params): Promise<Object | undefined>;
    create(serviceName: string, data: Object | Array<any>, params?: Params): Promise<Object | undefined>;
    update(serviceName: string, id: NullableId, data: Object | Array<any>, _params?: Params): Promise<Object | undefined>;
    patch(serviceName: string, id: NullableId, data: Object | Array<any>, _params?: Params): Promise<Object | undefined>;
    remove(serviceName: string, id: NullableId, _params?: Params): Promise<Object | undefined>;
}
export declare const getOptions: (app: any) => {
    app: any;
};
