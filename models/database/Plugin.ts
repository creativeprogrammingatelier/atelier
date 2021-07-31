import {UUIDHelper} from "../../api/src/helpers/UUIDHelper";
import {DBTools} from "../../api/src/database/HelperDB";

export interface Plugin {
    pluginID: string,
    webhookUrl: string,
    webhookSecret: string,
    publicKey: string,
}
export interface DBPlugin {
    pluginid: string,
    webhookurl: string,
    webhooksecret: string,
    publickey: string,
}
export interface PluginInput extends Partial<Plugin>, DBTools {}

export function convertPlugin(db: DBPlugin): Plugin {
    return {
        pluginID: UUIDHelper.fromUUID(db.pluginid),
        webhookSecret: db.webhooksecret,
        webhookUrl: db.webhookurl,
        publicKey: db.publickey
    };
}
