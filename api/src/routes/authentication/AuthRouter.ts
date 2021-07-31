import express from "express";

import {LoginProvider} from "../../../../models/api/LoginProvider";

import {
    clearTokenCookie,
    decodeToken,
    getToken,
    AuthError,
    verifyToken,
    issueToken,
    verifyTemporaryToken,
    setTokenCookie
} from "../../helpers/AuthenticationHelper";
import {config} from "../../helpers/ConfigurationHelper";
import {capture} from "../../helpers/ErrorHelper";

import {NotFoundDatabaseError} from "../../database/DatabaseErrors";
import {one} from "../../database/HelperDB";
import {PluginsDB} from "../../database/PluginsDB";
import {loginRouter} from "./LoginRouter";
import {getSamlRouter} from "./SamlRouter";
import { assertNever } from "../../../../helpers/Never";

/**
 * Authentication Routes file
 * Author: Andrew Heath, Arthur Rump
 * Date created: 13/08/19
 */

export const authRouter = express.Router();

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
        .join("\n");
}

/** Get list of login providers, to let the user choose how to login */
authRouter.get("/providers", capture(async (request, response) => {
    const providers: LoginProvider[] =
        config.loginProviders
            .filter(lc => !lc.hidden)
            .map(lc => ({name: lc.name, url: `/api/auth/${lc.id}/login`}));
    response.status(200).send(providers);
}));

/** Elevate to cookie autentication using a temporary token */
authRouter.get("/login", capture(async (request, response) => {
    const token = request.query.token as string;
    const userID = await verifyTemporaryToken(token);
    (await setTokenCookie(response, userID)).redirect("/");
}));

/** Log out from the session */
authRouter.get("/logout", (request, response) => {
    clearTokenCookie(response).redirect("/");
});

/** Get an access token for a plugin */
authRouter.get("/token", capture(async (request, response) => {
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