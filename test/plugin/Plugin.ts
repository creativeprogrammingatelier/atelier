import crypto from 'crypto';
import { Plugin } from '../../models/database/Plugin';
import { PluginsDB } from '../../api/src/database/PluginsDB';

export const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 1024 });
export const plugin: Plugin = {
    pluginID: "test",
    publicKey: publicKey.export({ format: "pem", type: "pkcs1" }) as string,
    webhookSecret: "TestSecretForTheWebhook",
    webhookUrl: "http://example.com/hook"
};

// Mock PluginsDB to return this plugin when looking for it
const filterPluginsOrig = PluginsDB.filterPlugins;
PluginsDB.filterPlugins = p => {
    if (p.pluginID === plugin.pluginID) {
        return Promise.resolve([plugin]);
    } else {
        return filterPluginsOrig(p);
    }
}