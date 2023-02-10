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
exports.closeInstance = exports.getInstance = void 0;
const lib_1 = require("@feathersjs/errors/lib");
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("feathers-nats-distributed:instance");
const nats_1 = require("nats");
let instance;
const getInstance = function (natsConfig = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn = {};
        Object.assign(conn, {
            servers: "localhost:4222",
        }, natsConfig);
        if (!instance || instance.isClosed()) {
            try {
                debug("Connecting to NATS with connection", conn);
                try {
                    instance = yield (0, nats_1.connect)(conn);
                    const info = instance.info;
                    debug("NATS server info", info);
                }
                catch (err) {
                    debug(err);
                    throw new lib_1.BadRequest("NATS connection exited because of error:", err);
                }
                instance.closed().then(err => {
                    if (err) {
                        console.error(`NATS connection exited because of error: ${err.message}`);
                        throw new lib_1.BadRequest("NATS connection exited because of error:", err.message);
                    }
                });
                debug("Connected to NATS server");
                return instance;
            }
            catch (e) {
                throw e;
            }
        }
        debug("returning NATS instance");
        return instance;
    });
};
exports.getInstance = getInstance;
const closeInstance = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (instance && !instance.isDraining() && !instance.isClosed()) {
            try {
                debug("draining and closing NATS connection");
                yield instance.drain();
            }
            catch (e) {
                throw e;
            }
        }
        debug("NATS connection closed");
    });
};
exports.closeInstance = closeInstance;
//# sourceMappingURL=instance.js.map