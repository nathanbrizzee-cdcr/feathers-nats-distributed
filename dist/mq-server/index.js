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
                const resp = new responses(app, appName, nats);
                const findSvc = yield resp.createService("find", "");
                const getSvc = yield resp.createService("get", "");
                const createSvc = yield resp.createService("create", "");
                const patchSvc = yield resp.createService("patch", "");
                const updateSvc = yield resp.createService("update", "");
                const removeSvc = yield resp.createService("remove", "");
            });
        };
    });
};
export { MQServer };
//# sourceMappingURL=index.js.map