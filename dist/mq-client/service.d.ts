import type { Id, NullableId, Params } from "@feathersjs/feathers";
import { NatsConnection } from "../instance";
import { InitConfig } from "../common/types";
export declare class NatsService {
    app: any;
    nats: NatsConnection;
    config: InitConfig;
    constructor(app: any, nats: NatsConnection, config: InitConfig);
    find(serverName: string, serviceName: string, _params?: Params): Promise<Array<any> | Object | undefined>;
    get(serverName: string, serviceName: string, id: Id, _params?: Params): Promise<Object | undefined>;
    create(serverName: string, serviceName: string, data: Object | Array<any>, params?: Params): Promise<Object | undefined>;
    update(serverName: string, serviceName: string, id: NullableId, data: Object | Array<any>, _params?: Params): Promise<Object | undefined>;
    patch(serverName: string, serviceName: string, id: NullableId, data: Object | Array<any>, _params?: Params): Promise<Object | undefined>;
    remove(serverName: string, serviceName: string, id: NullableId, _params?: Params): Promise<Object | undefined>;
}
