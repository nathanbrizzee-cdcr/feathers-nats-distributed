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
const debug = Debug("feathers-nats-distributed:server:index");
import { BadRequest } from "@feathersjs/errors";
import { getInstance } from "../instance";
import responses from "./response-handler";
let nats;
const MQServer = function MQServer(appName, natsConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        nats = yield getInstance(natsConfig);
        return function mqserver() {
            return __awaiter(this, void 0, void 0, function* () {
                const app = this;
                app.set("natsInstance", nats);
                try {
                    const conns = [];
                    const resp = new responses(app, appName, nats);
                    conns.push(resp.createService("find", ""));
                    conns.push(resp.createService("get", ""));
                    conns.push(resp.createService("create", ""));
                    conns.push(resp.createService("patch", ""));
                    conns.push(resp.createService("update", ""));
                    conns.push(resp.createService("remove", ""));
                    yield Promise.all(conns);
                }
                catch (e) {
                    throw new BadRequest(e.message, "An error occurred creating NATS service subscribers");
                }
            });
        };
    });
};
export { MQServer };
//# sourceMappingURL=index.js.map