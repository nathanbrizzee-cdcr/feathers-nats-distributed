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
exports.Client = exports.NatsService = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("feathers-nats-distributed:client:index");
const errors_1 = require("@feathersjs/errors");
const instance_1 = require("../instance");
const helpers_1 = require("../common/helpers");
const service_1 = require("./service");
Object.defineProperty(exports, "NatsService", { enumerable: true, get: function () { return service_1.NatsService; } });
let nats;
const Client = function (config) {
    return function mqclient() {
        const app = this;
        function main() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!config.appName) {
                    throw new errors_1.BadRequest("appName (the name of this server) is required ");
                }
                config.appName = (0, helpers_1.sanitizeAppName)(config.appName);
                nats = yield (0, instance_1.getInstance)(config.natsConfig);
                if (!app.get("NatsInstance")) {
                    app.set("NatsInstance", nats);
                }
                try {
                    const svc = new service_1.NatsService(app, nats, config);
                    if (!app.get("NatsService")) {
                        app.set("NatsService", svc);
                    }
                }
                catch (e) {
                    throw new errors_1.BadRequest("An error occurred creating NATS Service", e);
                }
            });
        }
        main();
        return this;
    };
};
exports.Client = Client;
//# sourceMappingURL=index.js.map