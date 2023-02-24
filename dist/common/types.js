"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceEventTypes = exports.ServiceTypes = exports.ServiceMethods = void 0;
var ServiceMethods;
(function (ServiceMethods) {
    ServiceMethods["Find"] = "find";
    ServiceMethods["Get"] = "get";
    ServiceMethods["Create"] = "create";
    ServiceMethods["Update"] = "update";
    ServiceMethods["Patch"] = "patch";
    ServiceMethods["Remove"] = "remove";
    ServiceMethods["Unknown"] = "";
})(ServiceMethods = exports.ServiceMethods || (exports.ServiceMethods = {}));
var ServiceTypes;
(function (ServiceTypes) {
    ServiceTypes["Unknown"] = "";
    ServiceTypes["Service"] = "servicecall";
    ServiceTypes["Event"] = "event";
    ServiceTypes["ServiceList"] = "servicelist";
})(ServiceTypes = exports.ServiceTypes || (exports.ServiceTypes = {}));
var ServiceEventTypes;
(function (ServiceEventTypes) {
    ServiceEventTypes["Created"] = "created";
    ServiceEventTypes["Updated"] = "updated";
    ServiceEventTypes["Patched"] = "patched";
    ServiceEventTypes["Removed"] = "removed";
})(ServiceEventTypes = exports.ServiceEventTypes || (exports.ServiceEventTypes = {}));
//# sourceMappingURL=types.js.map