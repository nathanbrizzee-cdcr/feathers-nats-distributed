import { ConnectionOptions } from "../instance";
export type ServerInitConfig = {
    appName: string;
    natsConfig: ConnectionOptions;
};
declare const Server: (config: ServerInitConfig) => (this: any) => void;
export { Server };
