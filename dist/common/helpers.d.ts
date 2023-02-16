import { ServiceActions } from "./types";
declare const sanitizeAppName: (appName: string) => string;
declare const getServiceName: (natsSubject: string) => ServiceActions;
export { sanitizeAppName, getServiceName };
