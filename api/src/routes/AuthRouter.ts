/**
 * Authentication Routes file
 * Author: Andrew Heath, Arthur Rump
 * Date created: 13/08/19
 */
import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { issueToken, getCurrentUserID } from '../helpers/AuthenticationHelper';
import { UserDB } from '../database/UserDB';

export const authRouter = express.Router();

/** Login endpoint, returns a token to use for subsequent requests */
authRouter.post('/login', async (req, res, next) => {
    UserDB.loginUser(
        req.body,
        // Success
        userID => {
            const token = issueToken(userID);
            res.status(200).json({ token });
        },
        // Unauthorized
        () => res.status(401).send(),
        // Error
        err => next(err));
});

/** Registration endpoint for new users */
authRouter.post('/register', async (req, res) => {
    try {
        const user = await UserDB.createUser(req.body);
        const token = issueToken(user.ID);
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json(err);
    }
});

/** Refresh the current users authentication with a new token */
authRouter.get('/refresh', AuthMiddleware.requireAuth, async (req, res) => {
    const userID = await getCurrentUserID(req);
    const token = issueToken(userID);
    res.status(200).json({ token });
});

/** Checks if request JWT token passed is valid using withAuth middleware method */
authRouter.get('/token', AuthMiddleware.requireAuth, (_, res) => res.sendStatus(200));
