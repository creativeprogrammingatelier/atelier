/**
 * Authentication Routes file
 * Author: Andrew Heath, Arthur Rump
 * Date created: 13/08/19
 */
import { config } from '../../helpers/ConfigurationHelper';

import express from 'express';
import { AuthMiddleware } from '../../middleware/AuthMiddleware';
import { issueToken, getCurrentUserID, clearTokenCookie } from '../../helpers/AuthenticationHelper';
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
authRouter.get('/logout', AuthMiddleware.requireAuth, (request, response) => {
    clearTokenCookie(response).redirect('/');
});

/** Refresh the current users authentication with a new token */
authRouter.get('/refresh', AuthMiddleware.requireAuth, capture(async (request, response) => {
    const userID = await getCurrentUserID(request);
    const token = issueToken(userID);
    response.status(200).json({ token });
}));

/** Checks if request JWT token passed is valid using withAuth middleware method */
authRouter.get('/token', AuthMiddleware.requireAuth, (_, res) => res.sendStatus(200));
