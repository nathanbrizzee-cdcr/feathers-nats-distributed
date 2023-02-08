var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Debug from "debug";
const debug = Debug("feathers-nats-distributed:instance");
import { connect } from "nats";
let instance;
const getInstance = function (natsConfig = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn = {};
        Object.assign(conn, natsConfig, {
            servers: "localhost:4222",
        });
        if (!instance || instance.isClosed()) {
            try {
                debug("Connecting to NATS with connection", conn);
                instance = yield connect(conn);
                instance.closed().then(err => {
                    if (err) {
                        console.error(`NATS connection exited because of error: ${err.message}`);
                    }
                });
                instance.on("connect", () => {
                    debug("Connected to NATS as Server");
                });
                instance.on("error", err => {
                    debug("nats connection errored", err);
                });
                instance.on("disconnect", () => {
                    debug("nats connection disconnected");
                });
                instance.on("close", () => {
                    debug("nats connection closed");
                });
                instance.on("timeout", () => {
                    debug("nats connection timeout");
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
export { getInstance, closeInstance };
//# sourceMappingURL=instance.js.map