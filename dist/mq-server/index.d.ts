import { ConnectionOptions } from "../instance";
export type ServerInitConfig = {
    appName: string;
    natsConfig: ConnectionOptions;
};
export type ServerInstance = (config: ServerInitConfig) => (this: any) => void;
export type ServerInstanceCallback = (this: any) => any;
declare const Server: (config: ServerInitConfig) => ServerInstance;
export { Server };
