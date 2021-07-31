import express from "express";

import {Plugin} from "../../../models/api/Plugin";
import {GlobalRole} from "../../../models/enums/GlobalRoleEnum";
import {PermissionEnum} from "../../../models/enums/PermissionEnum";

import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {capture, captureNext} from "../helpers/ErrorHelper";
import {requirePermission} from "../helpers/PermissionHelper";

import {transaction, one, map} from "../database/HelperDB";
import {PluginsDB} from "../database/PluginsDB";
import {UserDB} from "../database/UserDB";

export const pluginRouter = express.Router();

/** All endpoints require the managePlugins permission */
pluginRouter.use(captureNext(async(request, response, next) => {
    const userID = await getCurrentUserID(request);
    await requirePermission(userID, PermissionEnum.managePlugins);
    next();
}));

/** Get all registered plugins */
pluginRouter.get("/", capture(async(request, response) => {
    const barePlugins = await PluginsDB.filterPlugins({});
    const plugins: Plugin[] = await Promise.all(
        barePlugins.map(async plugin => {
            const withHooks = await PluginsDB.addHooks(plugin);
            const user = await UserDB.getUserByID(plugin.pluginID);
            return {...withHooks, user};
        }));
    response.send(plugins);
}));

/** Create a new plugin */
pluginRouter.post("/", capture(async(request, response) => {
    let userName: string = request.body.user?.name;
    if (!userName?.endsWith("(Plugin)")) {
        userName = userName + " (Plugin)";
    }
    const email: string = request.body.user?.email;
	
    const plugin: Plugin = await transaction(async client => {
        const user = await UserDB.createUser({
            userName,
            email,
            globalRole: GlobalRole.plugin,
            password: UserDB.invalidPassword(),
            client
        });
		
        const plugin = await PluginsDB.addPlugin({
            pluginID: user.ID,
            webhookUrl: request.body.webhookUrl,
            webhookSecret: request.body.webhookSecret,
            publicKey: request.body.publicKey,
            client
        });
		
        const hooks = await Promise.all(
            (request.body.hooks as string[])
                .map(hook => PluginsDB.addHook({pluginID: plugin.pluginID, hook, client}))
        );
		
        return {...plugin, hooks: hooks.map(ph => ph.hook), user};
    });
	
    response.send(plugin);
}));

/** Update an already registered plugin */
pluginRouter.put("/:userID", capture(async(request, response) => {
    const userID = request.params.userID;
	
    const plugin: Plugin = await transaction(async client => {
        let userName: string = request.body.user?.name;
        if (userName !== undefined && !userName.endsWith("(Plugin)")) {
            userName = userName + " (Plugin)";
        }
		
        let user = undefined;
        if (request.body.user) {
            user = await UserDB.updateUser({
                userID,
                userName,
                email: request.body.user?.email,
                client
            });
        } else {
            user = await UserDB.getUserByID(userID, {client});
        }
		
        let plugin = undefined;
        if (request.body.webhookUrl || request.body.webhookSecret || request.body.publicKey) {
            plugin = await PluginsDB.updatePlugin({
                pluginID: userID,
                webhookUrl: request.body.webhookUrl,
                webhookSecret: request.body.webhookSecret,
                publicKey: request.body.publicKey,
                client
            });
        } else {
            plugin = await PluginsDB.filterPlugins({pluginID: userID, client}).then(one);
        }
		
        let hooks = await PluginsDB.filterHooks({pluginID: userID, client}).then(map(ph => ph.hook));
        if (request.body.hooks) {
            const add = (request.body.hooks as string[]).filter(h => !hooks.some(ph => ph === h));
            const remove = hooks.filter(h => !request.body.hooks.includes(h));
			
            await Promise.all(add.map(hook => PluginsDB.addHook({pluginID: userID, hook, client})));
            await Promise.all(remove.map(hook => PluginsDB.deleteHook({pluginID: userID, hook, client})));
			
            hooks = request.body.hooks;
        }
		
        return {...plugin, hooks, user};
    });
	
    response.send(plugin);
}));

/** Delete a plugin */
pluginRouter.delete("/:userID", capture(async(request, response) => {
    const user = await UserDB.getUserByID(request.params.userID);
	
    if (user.permission.globalRole === GlobalRole.plugin) {
        await UserDB.deleteUser(request.params.userID);
    }
	
    response.send(user);
}));




