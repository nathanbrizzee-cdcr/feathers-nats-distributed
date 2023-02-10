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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
                debug("Connecting to NATS with ", conn);
                try {
                    instance = yield (0, nats_1.connect)(conn);
                    debug("NATS server info:", instance.info);
                }
                catch (err) {
                    instance = null;
                    debug(err);
                    throw new lib_1.GeneralError("NATS connection exited because of error:", err);
                }
                instance.closed().then(err => {
                    if (err) {
                        debug(`NATS connection exited because of error: ${err.message}`);
                        throw new lib_1.GeneralError("NATS connection exited because of error:", err.message);
                    }
                    else {
                        debug("NATS connection closed");
                        throw new lib_1.GeneralError("NATS connection closed");
                    }
                });
                (() => __awaiter(this, void 0, void 0, function* () {
                    var _a, e_1, _b, _c;
                    try {
                        for (var _d = true, _e = __asyncValues(instance.status()), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                            _c = _f.value;
                            _d = false;
                            try {
                                const s = _c;
                                debug(`NATS instance status change ${JSON.stringify(s, null, 2)}`);
                            }
                            finally {
                                _d = true;
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    debug("NATS status monitoring closed");
                }))();
                return instance;
            }
            catch (e) {
                debug("Unable to connect to NATS");
                debug(e);
                throw e;
            }
        }
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