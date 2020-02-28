/**
 * Authentication Routes file
 * Author: Andrew Heath, Arthur Rump
 * Date created: 13/08/19
 */
import { config } from '../../helpers/ConfigurationHelper';

import express from 'express';
import { AuthMiddleware } from '../../middleware/AuthMiddleware';
import { issueToken, getCurrentUserID } from '../../helpers/AuthenticationHelper';
import { capture } from '../../helpers/ErrorHelper';
import { getSamlRouter } from './SamlRouter';
import { loginRouter } from './LoginRouter';

export const authRouter = express.Router();

/** Helper function to make sure a switch is exhaustive */
function assertNever(x: never) { throw Error(`Object should be never: ${x}`); }

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

/** Refresh the current users authentication with a new token */
authRouter.get('/refresh', AuthMiddleware.requireAuth, capture(async (request, response) => {
    const userID = await getCurrentUserID(request);
    const token = issueToken(userID);
    response.status(200).json({ token });
}));

/** Checks if request JWT token passed is valid using withAuth middleware method */
authRouter.get('/token', AuthMiddleware.requireAuth, (_, res) => res.sendStatus(200));
