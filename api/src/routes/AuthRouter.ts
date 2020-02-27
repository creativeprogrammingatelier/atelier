/**
 * Authentication Routes file
 * Author: Andrew Heath, Arthur Rump
 * Date created: 13/08/19
 */
import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { issueToken, getCurrentUserID, AuthError } from '../helpers/AuthenticationHelper';
import { UserDB } from '../database/UserDB';
import { capture } from '../helpers/ErrorHelper';

export const authRouter = express.Router();

/** Login endpoint, returns a token to use for subsequent requests */
authRouter.post('/login', capture(async (request, response) => {
    UserDB.loginUser(
        request.body,
        // Success
        userID => {
            const token = issueToken(userID);
            response.status(200).json({ token });
        },
        // Unauthorized
        () => {
            throw new AuthError("credentials.invalid", "Your email or password is incorrect.");
        },
        // Error
        err => { 
            throw err; 
        }
    );
}));

/** Registration endpoint for new users */
authRouter.post('/register', capture(async (request, response) => {
    try {
        const user = await UserDB.createUser(request.body);
        const token = issueToken(user.userID!);
        response.status(200).json({ token });
    } catch (err) {
        response.status(500).json(err);
    }
}));

/** Refresh the current users authentication with a new token */
authRouter.get('/refresh', AuthMiddleware.requireAuth, capture(async (request, response) => {
    const userID = await getCurrentUserID(request);
    const token = issueToken(userID);
    response.status(200).json({ token });
}));

/** Checks if request JWT token passed is valid using withAuth middleware method */
authRouter.get('/token', AuthMiddleware.requireAuth, (_, res) => res.sendStatus(200));
