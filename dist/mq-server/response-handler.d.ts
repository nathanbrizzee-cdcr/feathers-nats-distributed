import { NatsConnection, Subscription } from "nats";
import { ServiceMethods } from "../common/types";
export default class natsResponse {
    private app;
    private nats;
    private appName;
    private Services;
    constructor(app: any, appName: string, nats: NatsConnection);
    createService(serviceMethod: ServiceMethods): Promise<Subscription>;
}
