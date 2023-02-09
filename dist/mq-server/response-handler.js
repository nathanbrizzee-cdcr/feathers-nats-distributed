"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nats_1 = require("nats");
const errors_1 = require("@feathersjs/errors");
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("feathers-nats-distributed:server:response-handler");
class natsResponse {
    constructor(app, appName, nats) {
        this.jsonCodec = (0, nats_1.JSONCodec)();
        this.stringCodec = (0, nats_1.StringCodec)();
        this.app = app;
        this.appName = appName;
        this.nats = nats;
        this.Services = Object.keys(app.services);
    }
    getServiceName(natsSubject) {
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
        debug(`service request for app=${serviceActions.serverName}; method=${serviceActions.methodName}; service=${serviceActions.serviceName};`);
        return serviceActions;
    }
    wrapError(error) {
        const newError = {};
        const __mqError = {};
        Object.getOwnPropertyNames(error).forEach(key => {
            newError[key] = error[key];
            __mqError[key] = error[key];
        });
        newError.__mqError = __mqError;
        return newError;
    }
    createService(serviceType) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const queueOpts = {
                queue: `${this.appName}.${serviceType}.>`,
            };
            debug("Creating subscription queue on ", queueOpts);
            const sub = this.nats.subscribe(queueOpts.queue, queueOpts);
            try {
                for (var _d = true, sub_1 = __asyncValues(sub), sub_1_1; sub_1_1 = yield sub_1.next(), _a = sub_1_1.done, !_a;) {
                    _c = sub_1_1.value;
                    _d = false;
                    try {
                        const m = _c;
                        const svcInfo = this.getServiceName(m.subject);
                        if (!this.Services.includes(svcInfo.serviceName)) {
                            const errorResponse = new errors_1.NotFound(`Service \`${svcInfo.serviceName}\` is not registered in this server.`);
                            debug("error response %O", errorResponse);
                            if (m.respond(this.jsonCodec.encode(errorResponse))) {
                                console.log(`[${svcInfo.serverName}] #${sub.getProcessed()} echoed ${this.stringCodec.decode(m.data)}`);
                            }
                            else {
                                console.log(`[${svcInfo.serverName}] #${sub.getProcessed()} ignoring request - no reply subject`);
                            }
                            continue;
                        }
                        const availableMethods = Object.keys(this.app.services[svcInfo.serviceName]);
                        if (!availableMethods.includes(svcInfo.methodName)) {
                            const errorResponse = new errors_1.MethodNotAllowed(`Method \`${svcInfo.methodName}\` is not supported by this endpoint.`);
                            debug("error response %O", errorResponse);
                            if (m.respond(this.jsonCodec.encode(errorResponse))) {
                                console.log(`[${svcInfo.serverName}] #${sub.getProcessed()} echoed ${this.jsonCodec.decode(m.data)}`);
                            }
                            else {
                                console.log(`[${svcInfo.serverName}] #${sub.getProcessed()} ignoring request - no reply subject`);
                            }
                            continue;
                        }
                        const request = this.jsonCodec.decode(m.data);
                        debug({ svcInfo, request });
                        let result;
                        try {
                            switch (serviceType) {
                                case "find":
                                    result = yield this.app
                                        .service(svcInfo.serviceName)
                                        .find(request.params);
                                    break;
                                case "get":
                                    result = yield this.app
                                        .service(svcInfo.serviceName)
                                        .get(request.id, request.params);
                                    break;
                                case "create":
                                    result = yield this.app
                                        .service(svcInfo.serviceName)
                                        .create(request.data, request.params);
                                    break;
                                case "patch":
                                    result = yield this.app
                                        .service(svcInfo.serviceName)
                                        .patch(request.id, request.data, request.params);
                                    break;
                                case "update":
                                    result = yield this.app
                                        .service(svcInfo.serviceName)
                                        .update(request.id, request.data, request.params);
                                    break;
                                case "remove":
                                    result = yield this.app
                                        .service(svcInfo.serviceName)
                                        .remove(request.id, request.params);
                                    break;
                                default:
                                    result = {};
                                    break;
                            }
                            const retal = m.respond(this.jsonCodec.encode(result));
                        }
                        catch (err) {
                            delete err.hook;
                            debug(err);
                            delete err.stack;
                            m.respond(this.jsonCodec.encode(err));
                        }
                    }
                    finally {
                        _d = true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = sub_1.return)) yield _b.call(sub_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return sub;
        });
    }
}
exports.default = natsResponse;
//# sourceMappingURL=response-handler.js.map