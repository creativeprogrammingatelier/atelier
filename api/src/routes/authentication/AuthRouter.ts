/**
 * Authentication Routes file
 * Author: Andrew Heath, Arthur Rump
 * Date created: 13/08/19
 */
import { config } from '../../helpers/ConfigurationHelper';

import express from 'express';
import { clearTokenCookie, decodeToken, getToken, AuthError, verifyToken, issueToken } from '../../helpers/AuthenticationHelper';
import { capture } from '../../helpers/ErrorHelper';
import { getSamlRouter } from './SamlRouter';
import { loginRouter } from './LoginRouter';
import { LoginProvider } from '../../../../models/api/LoginProvider';

export const authRouter = express.Router();

/** Helper function to make sure a switch is exhaustive */
function assertNever(x: never) { throw Error(`Object should be never: ${x}`); }

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
        default: assertNever(loginConfig);
    }
}

/** Get list of login providers, to let the user choose how to login */
authRouter.get('/providers', capture(async (request, response) => {
    const providers: LoginProvider[] = 
        config.loginProviders.map(lc => ({ name: lc.name, url: `/api/auth/${lc.id}/login` }));
    response.status(200).send(providers);
}));

/** Log out from the session */
authRouter.get('/logout', (request, response) => {
    clearTokenCookie(response).redirect('/');
});

/** Get an access token for a plugin */
authRouter.get('/token', capture(async (request, response) => {
    const token = getToken(request);
    const { iss: userID } = decodeToken<{ iss: string }>(token);
    const plugin = config.plugins.find(p => p.userID === userID);
    if (plugin === undefined) {
        throw new AuthError("plugin.unknown", "This plugin has not been registered with Atelier.");
    }
    const { exp, iat } = await verifyToken(token, plugin.publicKey, {
        algorithms: [ "RS256" ],
        issuer: userID
    });
    if (exp - iat > 10 * 60) throw new AuthError("token.exp", "Expiration time for this token may be a maximum of 10 minutes.");
    response.send({ token: issueToken(userID) });
}));