import { NatsConnection, Subscription } from "nats";
import { ServiceMethods, InitConfig } from "../common/types";
export default class natsResponse {
    private app;
    private nats;
    private config;
    private allServices;
    private Services;
    private timer;
    constructor(app: any, config: InitConfig, nats: NatsConnection);
    static getRandomInt(min?: number, max?: number): number;
    startServicePublisher(): Promise<void>;
    private _publishServices;
    createService(serviceMethod: ServiceMethods): Promise<Subscription>;
}
