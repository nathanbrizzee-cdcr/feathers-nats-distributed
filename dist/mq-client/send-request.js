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
const types_1 = require("../common/types");
function sendRequest(sendRequestScope) {
    return __awaiter(this, void 0, void 0, function* () {
        const { nats, request } = sendRequestScope;
        const serviceActions = {
            servicePath: sendRequestScope.serviceName,
            serverName: sendRequestScope.appName,
            methodName: sendRequestScope.methodName,
            serviceType: types_1.ServiceTypes.Service,
        };
        const subject = (0, helpers_1.makeNatsSubjectName)(serviceActions);
        debug(`Sending Request to NATS queue ${subject}`);
        const opts = {
            timeout: 20000,
        };
        try {
            const response = yield nats.request(subject, instance_1.jsonCodec.encode(request), opts);
            if (response instanceof nats_1.NatsError && response.code === nats_1.ErrorCode.Timeout) {
                throw new errors_1.BadRequest("Request timed out on feathers-mq.", serviceActions);
            }
            const decodedData = instance_1.jsonCodec.decode(response.data);
            debug("Received reply %0", decodedData);
            const reply = {
                data: decodedData.data,
                headers: decodedData.headers,
                error: decodedData.error,
            };
            if (reply.error) {
                debug(reply.error);
                throw new errors_1.FeathersError(reply.error.message, reply.error.name, reply.error.code, reply.error.className, {});
            }
            return reply;
        }
        catch (err) {
            switch (err.code) {
                case nats_1.ErrorCode.NoResponders:
                    throw new errors_1.Unavailable(`no one is listening to ${subject}`);
                case nats_1.ErrorCode.Timeout:
                    throw new errors_1.Timeout("someone is listening but didn't respond");
                default:
                    throw err;
            }
        }
    });
}
exports.sendRequest = sendRequest;
//# sourceMappingURL=send-request.js.map