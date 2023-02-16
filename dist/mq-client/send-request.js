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
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("feathers-mq:client:send-request");
const errors_1 = require("@feathersjs/errors");
const nats_1 = require("nats");
const instance_1 = require("../instance");
function sendRequest(sendRequestScope) {
    const { appName, nats, app, serviceName, methodName, request } = sendRequestScope;
    const subject = `service.${appName}.${serviceName}.${methodName}`;
    debug(`triggered ${subject}`);
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const opts = {
                timeout: 20000,
            };
            nats
                .request(subject, instance_1.jsonCodec.encode(request), opts)
                .then(response => {
                var _a, _b;
                if (response instanceof nats_1.NatsError &&
                    response.code === nats_1.ErrorCode.Timeout) {
                    return reject(new errors_1.BadRequest("Request timed out on feathers-mq.", {
                        appName,
                        serviceName,
                        methodName,
                    }));
                }
                const decodedData = instance_1.jsonCodec.decode(response.data);
                debug("Received reply %0", decodedData);
                const reply = {
                    data: (_a = decodedData.data) === null || _a === void 0 ? void 0 : _a.data,
                    headers: decodedData === null || decodedData === void 0 ? void 0 : decodedData.headers,
                    error: (_b = decodedData.data) === null || _b === void 0 ? void 0 : _b.error,
                };
                if (reply.error) {
                    return reject(response);
                }
                return resolve(reply);
            })
                .catch(e => {
                debug("a nats error occurred ", e);
                reject(e.message);
            });
        }
        catch (e) {
            debug("an error occurred ", e);
            reject(e.message);
        }
    }));
}
exports.default = sendRequest;
//# sourceMappingURL=send-request.js.map