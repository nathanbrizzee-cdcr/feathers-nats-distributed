import type { Id, NullableId, Params } from "@feathersjs/feathers";
import { NatsConnection } from "../instance";
import { InitConfig } from "../common/types";
export declare class NatsService {
    app: any;
    serviceName: string;
    nats: NatsConnection;
    config: InitConfig;
    constructor(app: any, serviceName: string, nats: NatsConnection, config: InitConfig);
    find(_params?: Params): Promise<Array<any> | Object | undefined>;
    get(id: Id, _params?: Params): Promise<Object | undefined>;
    create(data: Object | Array<any>, params?: Params): Promise<Object | undefined>;
    update(id: NullableId, data: Object | Array<any>, _params?: Params): Promise<Object | undefined>;
    patch(id: NullableId, data: Object | Array<any>, _params?: Params): Promise<Object | undefined>;
    remove(id: NullableId, _params?: Params): Promise<Object | undefined>;
}
export declare const getOptions: (app: any) => {
    app: any;
};
