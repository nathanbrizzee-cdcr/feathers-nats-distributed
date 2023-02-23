import { NatsConnection, Subscription } from "nats";
import { ServiceMethods, ServerConfig } from "../common/types";
export default class natsResponse {
    private app;
    private nats;
    private config;
    private allServices;
    private Services;
    private timer;
    private serverInfo;
    constructor(app: any, config: ServerConfig, nats: NatsConnection);
    static getRandomInt(min?: number, max?: number): number;
    startServicePublisher(): Promise<void>;
    stopServicePublisher(): void;
    private _publishServices;
    createService(serviceMethod: ServiceMethods): Promise<Subscription>;
}
