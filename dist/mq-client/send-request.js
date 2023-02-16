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
exports.sendRequest = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("feathers-nats-distributed:client:send-request");
const errors_1 = require("@feathersjs/errors");
const nats_1 = require("nats");
const helpers_1 = require("../common/helpers");
const instance_1 = require("../instance");
function sendRequest(sendRequestScope) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const { appName, nats, serviceName, methodName, request } = sendRequestScope;
        let newServicename = serviceName;
        if (serviceName.startsWith("/")) {
            newServicename = serviceName.replace("/", "");
        }
        newServicename = (0, helpers_1.sanitizeServiceName)(newServicename);
        const subject = `service.${appName}.${newServicename}.${methodName}`;
        debug(`triggered ${subject}`);
        const opts = {
            timeout: 20000,
        };
        try {
            const response = yield nats.request(subject, instance_1.jsonCodec.encode(request), opts);
            if (response instanceof nats_1.NatsError && response.code === nats_1.ErrorCode.Timeout) {
                throw new errors_1.BadRequest("Request timed out on feathers-mq.", {
                    appName,
                    newServicename,
                    methodName,
                });
            }
            const decodedData = instance_1.jsonCodec.decode(response.data);
            debug("Received reply %0", decodedData);
            const reply = {
                data: (_a = decodedData.data) === null || _a === void 0 ? void 0 : _a.data,
                headers: decodedData === null || decodedData === void 0 ? void 0 : decodedData.headers,
                error: (_b = decodedData.data) === null || _b === void 0 ? void 0 : _b.error,
            };
            if (reply.error) {
                debug(reply.error);
                throw new errors_1.BadRequest(reply.error);
            }
            return reply;
        }
        catch (err) {
            switch (err.code) {
                case nats_1.ErrorCode.NoResponders:
                    throw new errors_1.Unavailable(`no one is listening to ${subject}`);
                    break;
                case nats_1.ErrorCode.Timeout:
                    throw new errors_1.Timeout("someone is listening but didn't respond");
                    break;
                default:
                    throw new errors_1.BadRequest("request failed", err);
            }
        }
    });
}
exports.sendRequest = sendRequest;
//# sourceMappingURL=send-request.js.map