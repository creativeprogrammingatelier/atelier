import {UUIDHelper} from "../../api/src/helpers/UUIDHelper";
import {DBTools} from "../../api/src/database/HelperDB";

export interface PluginHook {
	pluginID: string,
	hook: string,
}
export interface DBPluginHook {
	pluginid: string,
	hook: string,
}
export type PluginHookInput = Partial<PluginHook> & DBTools

export function convertPluginHook(db: DBPluginHook): PluginHook {
    return {
        pluginID: UUIDHelper.fromUUID(db.pluginid),
        hook: db.hook
    };
}
