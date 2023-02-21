"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeNatsQueueOption = exports.makeNatsPubSubjectName = exports.makeNatsSubjectName = exports.sanitizeServiceName = exports.getServiceName = exports.sanitizeAppName = void 0;
const types_1 = require("./types");
const sanitizeAppName = function (appName) {
    const newAppName = appName.replace(/@/g, "").replace(/[&\/\\#,+()$%.'":*?<>{}]/g, "-") || "";
    return newAppName;
};
exports.sanitizeAppName = sanitizeAppName;
const getServiceName = function (natsSubject) {
    const subjectParts = natsSubject.split(".");
    const serviceActions = {
        serverName: "",
        servicePath: "",
        methodName: types_1.ServiceMethods.Unknown,
        serviceType: types_1.ServiceTypes.Unknown,
    };
    serviceActions.serviceType = subjectParts[0];
    if (subjectParts.length > 1) {
        serviceActions.serverName = subjectParts[1];
    }
    if (subjectParts.length > 2) {
        serviceActions.methodName = subjectParts[2];
    }
    if (subjectParts.length > 3) {
        serviceActions.servicePath = subjectParts.slice(3).join("/");
    }
    return serviceActions;
};
exports.getServiceName = getServiceName;
const makeNatsPubSubjectName = function (serviceActions) {
    let newServicename = serviceActions.servicePath;
    if (serviceActions.servicePath.startsWith("/")) {
        newServicename = serviceActions.servicePath.replace("/", "");
    }
    newServicename = sanitizeServiceName(newServicename);
    let newServerName = sanitizeAppName(serviceActions.serverName);
    const subject = `${serviceActions.serviceType}.${newServerName}`;
    return subject;
};
exports.makeNatsPubSubjectName = makeNatsPubSubjectName;
const makeNatsSubjectName = function (serviceActions) {
    let newServicename = serviceActions.servicePath;
    if (serviceActions.servicePath.startsWith("/")) {
        newServicename = serviceActions.servicePath.replace("/", "");
    }
    newServicename = sanitizeServiceName(newServicename);
    let newServerName = sanitizeAppName(serviceActions.serverName);
    const subject = `${serviceActions.serviceType}.${newServerName}.${serviceActions.methodName}.${newServicename}`;
    return subject;
};
exports.makeNatsSubjectName = makeNatsSubjectName;
const makeNatsQueueOption = function (serviceActions) {
    let newServerName = sanitizeAppName(serviceActions.serverName);
    const queue = `${serviceActions.serviceType}.${newServerName}.${serviceActions.methodName}.>`;
    return queue;
};
exports.makeNatsQueueOption = makeNatsQueueOption;
const sanitizeServiceName = function (serviceName) {
    const newServiceName = serviceName.replace(/\//g, ".") || "";
    return newServiceName;
};
exports.sanitizeServiceName = sanitizeServiceName;
//# sourceMappingURL=helpers.js.map