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
const errors_1 = require("@feathersjs/errors");
const helpers_1 = require("../common/helpers");
const types_1 = require("../common/types");
const instance_1 = require("../instance");
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("feathers-nats-distributed:server:response-handler");
class natsResponse {
    constructor(app, config, nats) {
        var _a, _b;
        this.app = app;
        this.config = Object.assign({}, config);
        this.nats = nats;
        this.allServices = Object.keys(app.services);
        this.Services = this.allServices;
        this.timer = null;
        if (((_a = this.config.servicePublisher) === null || _a === void 0 ? void 0 : _a.publishServices) === true &&
            ((_b = this.config.servicePublisher) === null || _b === void 0 ? void 0 : _b.servicesIgnoreList)) {
            for (let cnt = 0; cnt < this.config.servicePublisher.servicesIgnoreList.length; cnt++) {
                if (this.config.servicePublisher.servicesIgnoreList[cnt].startsWith("/")) {
                    this.config.servicePublisher.servicesIgnoreList[cnt] =
                        this.config.servicePublisher.servicesIgnoreList[cnt].replace("/", "");
                }
            }
            this.Services = [];
            this.allServices.forEach(serviceName => {
                var _a, _b;
                const found = (_b = (_a = this.config.servicePublisher) === null || _a === void 0 ? void 0 : _a.servicesIgnoreList) === null || _b === void 0 ? void 0 : _b.some(item => item === serviceName);
                if (!found) {
                    this.Services.push(serviceName);
                }
            });
        }
    }
    static getRandomInt(min = 1, max = 360000) {
        min = Math.ceil(Math.max(min, 1));
        max = Math.floor(Math.min(max, 360000));
        return Math.floor(Math.random() * (max - min) + min);
    }
    startServicePublisher() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (((_a = this.config.servicePublisher) === null || _a === void 0 ? void 0 : _a.publishServices) === true) {
                const randDelaySecs = natsResponse.getRandomInt(5000, 10000);
                const fixedDelaySecs = Math.max(((_b = this.config.servicePublisher) === null || _b === void 0 ? void 0 : _b.publishDelay) || 1000, 1000) ||
                    60000;
                debug(`Waiting ${randDelaySecs} seconds to start publishling services; then publishing every ${fixedDelaySecs} seconds`);
                const self = this;
                self.timer = setTimeout(function myTimer() {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield self._publishServices(self);
                        self.timer = setTimeout(myTimer, fixedDelaySecs);
                    });
                }, randDelaySecs);
            }
        });
    }
    _publishServices(self) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serviceActions = {
                    servicePath: "",
                    serverName: self.config.appName,
                    methodName: types_1.ServiceMethods.Unknown,
                    serviceType: types_1.ServiceTypes.ServiceList,
                };
                const subject = (0, helpers_1.makeNatsPubSubjectName)(serviceActions);
                const msg = { services: self.Services };
                debug(`Publishling service list to NATS subject ${subject}, ${JSON.stringify(msg)}`);
                yield self.nats.publish(subject, instance_1.jsonCodec.encode(msg));
            }
            catch (e) {
                debug(e);
                throw e;
            }
        });
    }
    createService(serviceMethod) {
        return __awaiter(this, void 0, void 0, function* () {
            const queueOpts = {
                queue: (0, helpers_1.makeNatsQueueOption)({
                    serviceType: types_1.ServiceTypes.Service,
                    serverName: this.config.appName,
                    methodName: serviceMethod,
                    servicePath: "",
                }),
            };
            debug("Creating service subscription queue on ", queueOpts.queue);
            const sub = this.nats.subscribe(queueOpts.queue, queueOpts);
            (() => __awaiter(this, void 0, void 0, function* () {
                var _a, e_1, _b, _c;
                try {
                    for (var _d = true, sub_1 = __asyncValues(sub), sub_1_1; sub_1_1 = yield sub_1.next(), _a = sub_1_1.done, !_a;) {
                        _c = sub_1_1.value;
                        _d = false;
                        try {
                            const m = _c;
                            try {
                                const svcInfo = (0, helpers_1.getServiceName)(m.subject);
                                if (!this.Services.includes(svcInfo.servicePath)) {
                                    throw new errors_1.NotFound(`Service \`${svcInfo.servicePath}\` is not registered in this server.`);
                                }
                                const availableMethods = Object.keys(this.app.services[svcInfo.servicePath]);
                                if (!availableMethods.includes(svcInfo.methodName)) {
                                    throw new errors_1.MethodNotAllowed(`Method \`${svcInfo.methodName}\` is not supported by this endpoint.`);
                                }
                                let result;
                                const request = instance_1.jsonCodec.decode(m.data);
                                debug(JSON.stringify({ svcInfo, request }, null, 2));
                                switch (serviceMethod) {
                                    case types_1.ServiceMethods.Find:
                                        result = yield this.app
                                            .service(svcInfo.servicePath)
                                            .find(request.params);
                                        break;
                                    case types_1.ServiceMethods.Get:
                                        result = yield this.app
                                            .service(svcInfo.servicePath)
                                            .get(request.id, request.params);
                                        break;
                                    case types_1.ServiceMethods.Create:
                                        result = yield this.app
                                            .service(svcInfo.servicePath)
                                            .create(request.data, request.params);
                                        break;
                                    case types_1.ServiceMethods.Patch:
                                        result = yield this.app
                                            .service(svcInfo.servicePath)
                                            .patch(request.id, request.data, request.params);
                                        break;
                                    case types_1.ServiceMethods.Update:
                                        result = yield this.app
                                            .service(svcInfo.servicePath)
                                            .update(request.id, request.data, request.params);
                                        break;
                                    case types_1.ServiceMethods.Remove:
                                        result = yield this.app
                                            .service(svcInfo.servicePath)
                                            .remove(request.id, request.params);
                                        break;
                                    default:
                                        result = {};
                                        break;
                                }
                                const reply = { data: result };
                                if (m.respond(instance_1.jsonCodec.encode(reply))) {
                                    debug(`[${this.config.appName}] reply #${sub.getProcessed()} => ${JSON.stringify(reply)}`);
                                }
                                else {
                                    debug(`[${this.config.appName}] #${sub.getProcessed()} ignoring request - no reply subject`);
                                }
                            }
                            catch (err) {
                                delete err.hook;
                                debug(err);
                                delete err.stack;
                                if (err.code &&
                                    typeof err.code === "string" &&
                                    err.code === "BAD_JSON") {
                                    err = new errors_1.BadRequest("Invalid JSON request received");
                                    debug(err);
                                }
                                const errObj = { error: err };
                                if (m.respond(instance_1.jsonCodec.encode(errObj))) {
                                    debug(`[${this.config.appName}] reply #${sub.getProcessed()} => ${JSON.stringify(errObj)}`);
                                }
                                else {
                                    debug(`[${this.config.appName}] #${sub.getProcessed()} ignoring request - no reply subject`);
                                }
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
                console.log("subscription closed");
            }))();
            return sub;
        });
    }
}
exports.default = natsResponse;
//# sourceMappingURL=response-handler.js.map