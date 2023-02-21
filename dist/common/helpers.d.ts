import { ServiceActions } from "./types";
declare const sanitizeAppName: (appName: string) => string;
declare const getServiceName: (natsSubject: string) => ServiceActions;
declare const makeNatsPubSubjectName: (serviceActions: ServiceActions) => string;
declare const makeNatsSubjectName: (serviceActions: ServiceActions) => string;
declare const makeNatsQueueOption: (serviceActions: ServiceActions) => string;
declare const sanitizeServiceName: (serviceName: string) => string;
export { sanitizeAppName, getServiceName, sanitizeServiceName, makeNatsSubjectName, makeNatsPubSubjectName, makeNatsQueueOption, };
