"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("feathers-nats-distributed:server:index");
const errors_1 = require("@feathersjs/errors");
const instance_1 = require("../instance");
const response_handler_1 = __importDefault(require("./response-handler"));
let nats;
const Server = function (config) {
    (0, instance_1.getInstance)(config.natsConfig).then(natsConn => {
        nats = natsConn;
    });
    return function mqserver() {
        const app = this;
        app.set("natsInstance", nats);
        try {
            const conns = [];
            const resp = new response_handler_1.default(app, config.appName, nats);
            conns.push(resp.createService("find", ""));
            conns.push(resp.createService("get", ""));
            conns.push(resp.createService("create", ""));
            conns.push(resp.createService("patch", ""));
            conns.push(resp.createService("update", ""));
            conns.push(resp.createService("remove", ""));
        }
        catch (e) {
            throw new errors_1.BadRequest(e.message, "An error occurred creating NATS service subscribers");
        }
        return this;
    };
};
exports.Server = Server;
//# sourceMappingURL=index.js.map