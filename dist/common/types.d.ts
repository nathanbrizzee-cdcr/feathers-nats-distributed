import { NatsConnection, ConnectionOptions, MsgHdrs } from "nats";
import type { NullableId, Params } from "@feathersjs/feathers";
import { FeathersError } from "@feathersjs/errors";
export type BaseConfig = {
    appName: string;
    appVersion: string;
    appInstanceID?: string;
    natsConfig: ConnectionOptions;
};
export type BaseServerConfig = {
    servicePublisher?: {
        publishServices: boolean;
        servicesIgnoreList?: string[];
        publishDelay: number;
    };
};
export type BaseClientConfig = {
    circuitBreakerConfig?: {
        enabled?: boolean;
        requestTimeout?: number;
        resetTimeout?: number;
        errorThresholdPercentage?: number;
    };
};
export type ServerConfig = BaseConfig & BaseServerConfig;
export type ClientConfig = BaseConfig & BaseClientConfig;
export type ServiceActions = {
    serverName: string;
    servicePath: string;
    methodName: ServiceMethods;
    serviceType: ServiceTypes;
};
export declare enum ServiceMethods {
    Find = "find",
    Get = "get",
    Create = "create",
    Update = "update",
    Patch = "patch",
    Remove = "remove",
    Unknown = ""
}
export declare enum ServiceTypes {
    Unknown = "",
    Service = "servicecall",
    Event = "event",
    ServiceList = "servicelist"
}
export declare enum ServiceEventTypes {
    Created = "created",
    Updated = "updated",
    Patched = "patched",
    Removed = "removed"
}
export type ServerInfo = {
    name: string;
    version: string;
    id: string;
};
export type RequestParams = {
    id?: NullableId;
    params?: Params;
    data?: Object | Array<any>;
};
export type SendRequestScope = {
    appName: string;
    nats: NatsConnection;
    app: any;
    serverInfo: ServerInfo;
    config: ClientConfig;
    serviceName: string;
    methodName: ServiceMethods;
    request: RequestParams;
};
export type Reply = {
    data?: Object | Array<any>;
    error?: FeathersError;
    headers?: MsgHdrs;
    serverInfo?: ServerInfo;
};
