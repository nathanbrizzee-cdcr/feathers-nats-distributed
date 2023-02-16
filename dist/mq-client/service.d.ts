import type { Id, NullableId, Params } from "@feathersjs/feathers";
import { NatsConnection } from "../instance";
import { InitConfig } from "../common/types";
export declare class NatsService {
    app: any;
    serviceName: string;
    nats: NatsConnection;
    config: InitConfig;
    constructor(app: any, serviceName: string, nats: NatsConnection, config: InitConfig);
    find(_params?: Params): Promise<Array<any>>;
    get(id: Id, _params?: Params): Promise<Object>;
    create(data: Object | Array<any>, params?: Params): Promise<Object>;
    update(id: NullableId, data: Object | Array<any>, _params?: Params): Promise<Object>;
    patch(id: NullableId, data: Object | Array<any>, _params?: Params): Promise<Object>;
    remove(id: NullableId, _params?: Params): Promise<Object>;
}
export declare const getOptions: (app: any) => {
    app: any;
};
