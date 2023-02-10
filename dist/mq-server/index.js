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
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("feathers-nats-distributed:mq-server:index");
const errors_1 = require("@feathersjs/errors");
const instance_1 = require("../instance");
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
                nats = yield (0, instance_1.getInstance)(config.natsConfig);
                app.set("natsInstance", nats);
                try {
                    const conns = [];
                    const resp = new response_handler_1.default(app, config.appName, nats);
                    conns.push(resp.createService("find"));
                    conns.push(resp.createService("get"));
                    conns.push(resp.createService("create"));
                    conns.push(resp.createService("patch"));
                    conns.push(resp.createService("update"));
                    conns.push(resp.createService("remove"));
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