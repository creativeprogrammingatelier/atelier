import express from 'express';
import { capture, captureNext } from '../helpers/ErrorHelper';
import { UserDB } from '../database/UserDB';
import { globalRole } from '../../../models/enums/globalRoleEnum';
import { PluginsDB } from '../database/PluginsDB';
import { transaction, one, map } from '../database/HelperDB';
import { Plugin } from '../../../models/api/Plugin';
import { requirePermission } from '../helpers/PermissionHelper';
import { getCurrentUserID } from '../helpers/AuthenticationHelper';
import { PermissionEnum } from '../../../models/enums/permissionEnum';

export const pluginRouter = express.Router()

/** All enpoints require the manageUserRegistration permission */
pluginRouter.use(captureNext(async (request, response, next) => {
    const userID = await getCurrentUserID(request);
    await requirePermission(userID, PermissionEnum.manageUserRegistration);
    next();
}));

/** Get all registered plugins */
pluginRouter.get('/', capture(async (request, response) => {
    const barePlugins = await PluginsDB.filterPlugins({});
    const plugins: Plugin[] = await Promise.all(
        barePlugins.map(async plugin => {
            const withHooks = await PluginsDB.addHooks(plugin);
            const user = await UserDB.getUserByID(plugin.pluginID);
            return { ...withHooks, user };
        }));
    response.send(plugins);
}));

/** Create a new plugin */
pluginRouter.post('/', capture(async (request, response) => {
    const userName = request.body.userName;
    const email = request.body.email;

    const plugin: Plugin = await transaction(async client => {
        const user = await UserDB.createUser({
            userName,
            email, 
            role: globalRole.plugin,
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
                .map(hook => PluginsDB.addHook({ pluginID: plugin.pluginID, hook }))
        );

        return { ...plugin, hooks: hooks.map(ph => ph.hook), user };
    });

    response.send(plugin);
}));

/** Update an already registered plugin */
pluginRouter.put('/:userID', capture(async (request, response) => {
    const userID = request.params.userID;

    const plugin: Plugin = await transaction(async client => {
        let user = undefined;
        if (request.body.name || request.body.email) {
            user = await UserDB.updateUser({
                userID,
                userName: request.body.userName,
                email: request.body.email,
                client
            });
        } else {
            user = await UserDB.getUserByID(userID, { client });
        }

        let plugin = undefined;
        if (request.body.webhookUrl || request.body.webhookSecret || request.body.publicKey) {
            plugin = await PluginsDB.updatePlugin({
                pluginID: userID,
                webhookUrl: request.body.webhookUrl,
                webhookSecret: request.body.webhookSecret,
                publicKey: request.body.publicKey
            });
        } else {
            plugin = await PluginsDB.filterPlugins({ pluginID: userID }).then(one);
        }

        let hooks = await PluginsDB.filterHooks({ pluginID: userID }).then(map(ph => ph.hook));
        if (request.body.hooks) {
            const add = (request.body.hooks as string[]).filter(h => !hooks.some(ph => ph === h));
            const remove = hooks.filter(h => !request.body.hooks.includes(h));

            await Promise.all(add.map(hook => PluginsDB.addHook({ pluginID: userID, hook })));
            await Promise.all(remove.map(hook => PluginsDB.deleteHook({ pluginID: userID, hook })));

            hooks = request.body.hooks;
        }

        return { ...plugin, hooks, user };
    });

    response.send(plugin);
}));

/** Delete a plugin */
pluginRouter.delete('/:userID', capture(async (request, response) => {
    const user = await UserDB.getUserByID(request.params.userID);

    if (user.permission.role === globalRole.plugin) {
        await UserDB.deleteUser(request.params.userID);
    }

    response.status(204).send();
}));