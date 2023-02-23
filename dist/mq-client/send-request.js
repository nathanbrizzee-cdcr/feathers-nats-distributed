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
const opossum_1 = __importDefault(require("opossum"));
const helpers_1 = require("../common/helpers");
const instance_1 = require("../instance");
const types_1 = require("../common/types");
const sendGetRequest = function (nats, subject, jsonMsg, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield nats.request(subject, jsonMsg, opts);
    });
};
let breaker = null;
function sendRequest(sendRequestScope) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const { nats, request, serverInfo, config } = sendRequestScope;
        const serviceActions = {
            servicePath: sendRequestScope.serviceName,
            serverName: sendRequestScope.appName,
            methodName: sendRequestScope.methodName,
            serviceType: types_1.ServiceTypes.Service,
        };
        const subject = (0, helpers_1.makeNatsSubjectName)(serviceActions);
        debug(`Sending Request to NATS queue ${subject}`);
        const circuitBreakerOptions = {
            timeout: ((_a = config.circuitBreakerConfig) === null || _a === void 0 ? void 0 : _a.requestTimeout) || 5000,
            errorThresholdPercentage: ((_b = config.circuitBreakerConfig) === null || _b === void 0 ? void 0 : _b.errorThresholdPercentage) || 50,
            resetTimeout: ((_c = config.circuitBreakerConfig) === null || _c === void 0 ? void 0 : _c.resetTimeout) || 30000,
        };
        const opts = {
            timeout: circuitBreakerOptions.timeout + 50,
        };
        try {
            if (nats && !nats.isDraining() && !nats.isClosed()) {
                const jsonMsg = instance_1.jsonCodec.encode({ request, serverInfo });
                if (!breaker) {
                    debug(`Initializing circuit breaker with ${JSON.stringify(circuitBreakerOptions)}`);
                    breaker = new opossum_1.default(sendGetRequest, circuitBreakerOptions);
                }
                let response = null;
                try {
                    response = yield breaker.fire(nats, subject, jsonMsg, opts);
                }
                catch (e) {
                    const stats = breaker.stats;
                    const errorRate = ((stats.failures || stats.rejects) / stats.fires) * 100;
                    debug(`Circuit Breaker Error Stats with an error rate of ${errorRate}%:\n${JSON.stringify(stats, null, 2)}`);
                    throw e;
                }
                if (response instanceof nats_1.NatsError &&
                    response.code === nats_1.ErrorCode.Timeout) {
                    throw new errors_1.BadRequest("Request timed out on feathers-nats-distributed.", serviceActions);
                }
                const decodedData = instance_1.jsonCodec.decode(response.data);
                debug(`Received reply ${JSON.stringify(decodedData)}`);
                const reply = {
                    data: decodedData.data,
                    headers: decodedData.headers,
                    error: decodedData.error,
                    serverInfo: decodedData.serverInfo,
                };
                if (reply.error) {
                    debug(reply.error);
                    throw new errors_1.FeathersError(reply.error.message, reply.error.name, reply.error.code, reply.error.className, {});
                }
                return reply;
            }
            else {
                debug("NATS is draining or is closed.");
                const reply = {
                    error: new errors_1.BadRequest("NATS server is draining or closed"),
                };
                return reply;
            }
        }
        catch (err) {
            switch (err.code) {
                case nats_1.ErrorCode.NoResponders:
                    throw new errors_1.Unavailable(`No listeners subscribed to ${subject}`);
                case nats_1.ErrorCode.Timeout:
                    throw new errors_1.Timeout(`NATS service call timed out. ${err.message}`);
                case "ETIMEDOUT":
                    throw new errors_1.Timeout(`Circuit breaker timeout. ${err.message}`);
                default:
                    throw new errors_1.Unavailable(err.message);
            }
        }
    });
}
exports.sendRequest = sendRequest;
//# sourceMappingURL=send-request.js.map