"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceTypes = exports.ServiceMethods = void 0;
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
    ServiceTypes["Service"] = "service";
    ServiceTypes["Event"] = "event";
    ServiceTypes["ServiceList"] = "servicelist";
})(ServiceTypes = exports.ServiceTypes || (exports.ServiceTypes = {}));
//# sourceMappingURL=types.js.map