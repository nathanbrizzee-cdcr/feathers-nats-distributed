import { NatsConnection, Subscription } from "nats";
export default class natsResponse {
    private app;
    private nats;
    private jsonCodec;
    private stringCodec;
    private appName;
    private Services;
    constructor(app: any, appName: string, nats: NatsConnection);
    private getServiceName;
    private wrapError;
    createService(serviceType: string): Promise<Subscription>;
}
