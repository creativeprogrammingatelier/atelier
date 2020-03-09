import crypto from 'crypto';

export const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 1024 });
export const plugin = {
    userID: "test",
    publicKey: publicKey.export({ format: "pem", type: "pkcs1" }) as string,
    hooks: [ "testhook" ],
    webhookSecret: "TestSecretForTheWebhook",
    webhookUrl: "http://example.com/hook"
};

// We want to change the config, so don't let it be frozen
const freeze = Object.freeze;
Object.freeze = <T>(x: T) => x;

// Now import config and update it
import { config } from '../../api/src/helpers/ConfigurationHelper'
config.plugins = [ plugin ];

// Reset freeze
Object.freeze = freeze;
Object.freeze(config);