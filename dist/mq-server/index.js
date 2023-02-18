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
exports.Server = void 0;
const errors_1 = require("@feathersjs/errors");
const instance_1 = require("../instance");
const helpers_1 = require("../common/helpers");
const types_1 = require("../common/types");
const response_handler_1 = __importDefault(require("./response-handler"));
let nats;
const Server = function (config) {
    return function mqserver() {
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
                    const conns = [];
                    const resp = new response_handler_1.default(app, config.appName, nats);
                    conns.push(resp.createService(types_1.ServiceMethods.Find));
                    conns.push(resp.createService(types_1.ServiceMethods.Get));
                    conns.push(resp.createService(types_1.ServiceMethods.Create));
                    conns.push(resp.createService(types_1.ServiceMethods.Patch));
                    conns.push(resp.createService(types_1.ServiceMethods.Update));
                    conns.push(resp.createService(types_1.ServiceMethods.Remove));
                    Promise.all(conns);
                }
                catch (e) {
                    throw new errors_1.BadRequest("An error occurred creating NATS service subscribers", e);
                }
            });
        }
        main();
        return this;
    };
};
exports.Server = Server;
//# sourceMappingURL=index.js.map