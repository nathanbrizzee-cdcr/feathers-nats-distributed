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
exports.getOptions = exports.NatsService = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("feathers-mq:client:service");
const types_1 = require("../common/types");
const sendRequest = require("./send-request");
class NatsService {
    constructor(app, serviceName, nats, config) {
        this.app = app;
        this.serviceName = serviceName;
        this.nats = nats;
        this.config = config;
    }
    find(_params) {
        return __awaiter(this, void 0, void 0, function* () {
            const sendRequestScope = {
                appName: this.config.appName,
                nats: this.nats,
                app: this.app,
                serviceName: this.serviceName,
                methodName: types_1.ServiceMethods.Find,
                request: { params: _params },
            };
            return sendRequest.call(sendRequestScope);
        });
    }
    get(id, _params) {
        return __awaiter(this, void 0, void 0, function* () {
            const sendRequestScope = {
                appName: this.config.appName,
                nats: this.nats,
                app: this.app,
                serviceName: this.serviceName,
                methodName: types_1.ServiceMethods.Get,
                request: { id: id, params: _params },
            };
            return sendRequest.call(sendRequestScope);
        });
    }
    create(data, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(data)) {
                return Promise.all(data.map(current => this.create(current, params)));
            }
            const sendRequestScope = {
                appName: this.config.appName,
                nats: this.nats,
                app: this.app,
                serviceName: this.serviceName,
                methodName: types_1.ServiceMethods.Create,
                request: { data: data, params: params },
            };
            return sendRequest.call(sendRequestScope);
        });
    }
    update(id, data, _params) {
        return __awaiter(this, void 0, void 0, function* () {
            const sendRequestScope = {
                appName: this.config.appName,
                nats: this.nats,
                app: this.app,
                serviceName: this.serviceName,
                methodName: types_1.ServiceMethods.Update,
                request: { id: id, data: data, params: _params },
            };
            return sendRequest.call(sendRequestScope);
        });
    }
    patch(id, data, _params) {
        return __awaiter(this, void 0, void 0, function* () {
            const sendRequestScope = {
                appName: this.config.appName,
                nats: this.nats,
                app: this.app,
                serviceName: this.serviceName,
                methodName: types_1.ServiceMethods.Patch,
                request: { id: id, data: data, params: _params },
            };
            return sendRequest.call(sendRequestScope);
        });
    }
    remove(id, _params) {
        return __awaiter(this, void 0, void 0, function* () {
            const sendRequestScope = {
                appName: this.config.appName,
                nats: this.nats,
                app: this.app,
                serviceName: this.serviceName,
                methodName: types_1.ServiceMethods.Remove,
                request: { id: id, params: _params },
            };
            return sendRequest.call(sendRequestScope);
        });
    }
}
exports.NatsService = NatsService;
const getOptions = (app) => {
    return { app };
};
exports.getOptions = getOptions;
//# sourceMappingURL=service.js.map