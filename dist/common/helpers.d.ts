import { ServiceActions } from "./types";
declare const sanitizeAppName: (appName: string) => string;
declare const getServiceName: (natsSubject: string) => ServiceActions;
declare const sanitizeServiceName: (serviceName: string) => string;
export { sanitizeAppName, getServiceName, sanitizeServiceName };
