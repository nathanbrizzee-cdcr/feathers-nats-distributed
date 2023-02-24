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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NatsService = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("feathers-nats-distributed:client:service");
const types_1 = require("../common/types");
const { sendRequest } = require("./send-request");
class NatsService {
    constructor(app, nats, config) {
        this.app = app;
        this.nats = nats;
        this.config = config;
        this.serverInfo = {
            name: this.config.appName,
            version: this.config.appVersion,
            id: this.config.appInstanceID,
        };
    }
    find(serverName, serviceName, _params) {
        return __awaiter(this, void 0, void 0, function* () {
            const sendRequestScope = {
                appName: serverName,
                nats: this.nats,
                app: this.app,
                serverInfo: this.serverInfo,
                config: this.config,
                serviceName: serviceName,
                methodName: types_1.ServiceMethods.Find,
                request: {
                    params: {
                        query: _params === null || _params === void 0 ? void 0 : _params.query,
                        provider: _params === null || _params === void 0 ? void 0 : _params.provider,
                        authentication: _params === null || _params === void 0 ? void 0 : _params.authentication,
                        authenticated: _params === null || _params === void 0 ? void 0 : _params.authenticated,
                        user: _params === null || _params === void 0 ? void 0 : _params.user,
                        route: _params === null || _params === void 0 ? void 0 : _params.route,
                        headers: _params === null || _params === void 0 ? void 0 : _params.headers,
                    },
                },
            };
            const reply = yield sendRequest(sendRequestScope);
            return reply.data;
        });
    }
    get(serverName, serviceName, id, _params) {
        return __awaiter(this, void 0, void 0, function* () {
            const sendRequestScope = {
                appName: serverName,
                nats: this.nats,
                app: this.app,
                serverInfo: this.serverInfo,
                config: this.config,
                serviceName: serviceName,
                methodName: types_1.ServiceMethods.Get,
                request: {
                    id: id,
                    params: {
                        query: _params === null || _params === void 0 ? void 0 : _params.query,
                        provider: _params === null || _params === void 0 ? void 0 : _params.provider,
                        authentication: _params === null || _params === void 0 ? void 0 : _params.authentication,
                        authenticated: _params === null || _params === void 0 ? void 0 : _params.authenticated,
                        user: _params === null || _params === void 0 ? void 0 : _params.user,
                        route: _params === null || _params === void 0 ? void 0 : _params.route,
                        headers: _params === null || _params === void 0 ? void 0 : _params.headers,
                    },
                },
            };
            const reply = yield sendRequest(sendRequestScope);
            return reply.data;
        });
    }
    create(serverName, serviceName, data, _params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(data)) {
                return Promise.all(data.map(current => this.create(serverName, serviceName, current, _params)));
            }
            const sendRequestScope = {
                appName: serverName,
                nats: this.nats,
                app: this.app,
                serverInfo: this.serverInfo,
                config: this.config,
                serviceName: serviceName,
                methodName: types_1.ServiceMethods.Create,
                request: {
                    data: data,
                    params: {
                        query: _params === null || _params === void 0 ? void 0 : _params.query,
                        provider: _params === null || _params === void 0 ? void 0 : _params.provider,
                        authentication: _params === null || _params === void 0 ? void 0 : _params.authentication,
                        authenticated: _params === null || _params === void 0 ? void 0 : _params.authenticated,
                        user: _params === null || _params === void 0 ? void 0 : _params.user,
                        route: _params === null || _params === void 0 ? void 0 : _params.route,
                        headers: _params === null || _params === void 0 ? void 0 : _params.headers,
                    },
                },
            };
            const reply = yield sendRequest(sendRequestScope);
            return reply.data;
        });
    }
    update(serverName, serviceName, id, data, _params) {
        return __awaiter(this, void 0, void 0, function* () {
            const sendRequestScope = {
                appName: serverName,
                nats: this.nats,
                app: this.app,
                serverInfo: this.serverInfo,
                config: this.config,
                serviceName: serviceName,
                methodName: types_1.ServiceMethods.Update,
                request: {
                    id: id,
                    data: data,
                    params: {
                        query: _params === null || _params === void 0 ? void 0 : _params.query,
                        provider: _params === null || _params === void 0 ? void 0 : _params.provider,
                        authentication: _params === null || _params === void 0 ? void 0 : _params.authentication,
                        authenticated: _params === null || _params === void 0 ? void 0 : _params.authenticated,
                        user: _params === null || _params === void 0 ? void 0 : _params.user,
                        route: _params === null || _params === void 0 ? void 0 : _params.route,
                        headers: _params === null || _params === void 0 ? void 0 : _params.headers,
                    },
                },
            };
            const reply = yield sendRequest(sendRequestScope);
            return reply.data;
        });
    }
    patch(serverName, serviceName, id, data, _params) {
        return __awaiter(this, void 0, void 0, function* () {
            const sendRequestScope = {
                appName: serverName,
                nats: this.nats,
                app: this.app,
                serverInfo: this.serverInfo,
                config: this.config,
                serviceName: serviceName,
                methodName: types_1.ServiceMethods.Patch,
                request: {
                    id: id,
                    data: data,
                    params: {
                        query: _params === null || _params === void 0 ? void 0 : _params.query,
                        provider: _params === null || _params === void 0 ? void 0 : _params.provider,
                        authentication: _params === null || _params === void 0 ? void 0 : _params.authentication,
                        authenticated: _params === null || _params === void 0 ? void 0 : _params.authenticated,
                        user: _params === null || _params === void 0 ? void 0 : _params.user,
                        route: _params === null || _params === void 0 ? void 0 : _params.route,
                        headers: _params === null || _params === void 0 ? void 0 : _params.headers,
                    },
                },
            };
            const reply = yield sendRequest(sendRequestScope);
            return reply.data;
        });
    }
    remove(serverName, serviceName, id, _params) {
        return __awaiter(this, void 0, void 0, function* () {
            const sendRequestScope = {
                appName: serverName,
                nats: this.nats,
                app: this.app,
                serverInfo: this.serverInfo,
                config: this.config,
                serviceName: serviceName,
                methodName: types_1.ServiceMethods.Remove,
                request: {
                    id: id,
                    params: {
                        query: _params === null || _params === void 0 ? void 0 : _params.query,
                        provider: _params === null || _params === void 0 ? void 0 : _params.provider,
                        authentication: _params === null || _params === void 0 ? void 0 : _params.authentication,
                        authenticated: _params === null || _params === void 0 ? void 0 : _params.authenticated,
                        user: _params === null || _params === void 0 ? void 0 : _params.user,
                        route: _params === null || _params === void 0 ? void 0 : _params.route,
                        headers: _params === null || _params === void 0 ? void 0 : _params.headers,
                    },
                },
            };
            const reply = yield sendRequest(sendRequestScope);
            return reply.data;
        });
    }
}
exports.NatsService = NatsService;
//# sourceMappingURL=service.js.map