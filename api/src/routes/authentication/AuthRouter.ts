/**
 * Authentication Routes file
 * Author: Andrew Heath, Arthur Rump
 * Date created: 13/08/19
 */
import {config} from '../../helpers/ConfigurationHelper';

import express from 'express';
import {
    clearTokenCookie,
    decodeToken,
    getToken,
    AuthError,
    verifyToken,
    issueToken
} from '../../helpers/AuthenticationHelper';
import {capture} from '../../helpers/ErrorHelper';
import {getSamlRouter} from './SamlRouter';
import {loginRouter} from './LoginRouter';
import {LoginProvider} from '../../../../models/api/LoginProvider';
import {PluginsDB} from '../../database/PluginsDB';
import {NotFoundDatabaseError} from '../../database/DatabaseErrors';
import {one} from '../../database/HelperDB';

export const authRouter = express.Router();

/** Helper function to make sure a switch is exhaustive */
function assertNever(x: never) {
    throw Error(`Object should be never: ${x}`);
}

// Add routers for all configured providers
for (const loginConfig of config.loginProviders) {
    const endpoint = `/${loginConfig.id}`;
    switch (loginConfig.type) {
        case "saml":
            getSamlRouter(loginConfig)
                .then(samlRouter => authRouter.use(endpoint, samlRouter));
            break;
        case "builtin":
            authRouter.use(endpoint, loginRouter);
            break;
        default:
            assertNever(loginConfig);
    }
}

/** Get list of login providers, to let the user choose how to login */
authRouter.get('/providers', capture(async (request, response) => {
    const providers: LoginProvider[] =
        config.loginProviders.map(lc => ({name: lc.name, url: `/api/auth/${lc.id}/login`}));
    response.status(200).send(providers);
}));

/** Log out from the session */
authRouter.get('/logout', (request, response) => {
    clearTokenCookie(response).redirect('/');
});

/**
 * Helper that converts a certificate into a public key
 * and removes invalid spacing
 */
function preparePublicKey(keyOrCertificate: string) {
    return keyOrCertificate
        .replace("-----BEGIN CERTIFICATE-----", "-----BEGIN PUBLIC KEY-----")
        .replace("-----END CERTIFICATE-----", "-----END PUBLIC KEY-----")
        .split(/\r?\n/)
        .map(line => line.trim())
        .join('\n');
}

/** Get an access token for a plugin */
authRouter.get('/token', capture(async (request, response) => {
    const token = getToken(request);
    const {iss: userID} = decodeToken<{ iss: string }>(token);
    let plugin = undefined;
    try {
        plugin = await PluginsDB.filterPlugins({pluginID: userID}).then(one);
    } catch (err) {
        if (err instanceof NotFoundDatabaseError) {
            throw new AuthError("plugin.unknown", "This plugin has not been registered with Atelier.");
        } else {
            throw err;
        }
    }
    const {exp, iat} = await verifyToken(token, preparePublicKey(plugin.publicKey), {
        algorithms: ["RS256"],
        issuer: userID
    });
    if (exp - iat > 10 * 60) throw new AuthError("token.exp", "Expiration time for this token may be a maximum of 10 minutes.");
    response.send({token: issueToken(userID)});
}));