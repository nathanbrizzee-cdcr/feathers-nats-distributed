"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceName = exports.sanitizeAppName = void 0;
const sanitizeAppName = function (appName) {
    const newAppName = appName.replace(/@/g, "").replace(/./g, "-").replace(/>/g, "-") || "";
    return newAppName;
};
exports.sanitizeAppName = sanitizeAppName;
const getServiceName = function (natsSubject) {
    const subjectParts = natsSubject.split(".");
    const serviceActions = {
        serverName: "",
        serviceName: "",
        methodName: "",
    };
    serviceActions.serverName = subjectParts[0];
    if (subjectParts.length > 1) {
        serviceActions.methodName = subjectParts[1];
    }
    if (subjectParts.length > 2) {
        serviceActions.serviceName = subjectParts.slice(2).join("/");
    }
    return serviceActions;
};
exports.getServiceName = getServiceName;
//# sourceMappingURL=helpers.js.map