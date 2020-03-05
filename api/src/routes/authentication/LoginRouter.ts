import express from 'express';
import { capture } from "../../helpers/ErrorHelper";
import { UserDB } from '../../database/UserDB';
import { issueToken, AuthError } from '../../helpers/AuthenticationHelper';

export const loginRouter = express.Router();

/** Login endpoint, returns a token to use for subsequent requests */
loginRouter.post('/login', capture(async (request, response) => {
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
loginRouter.post('/register', capture(async (request, response) => {
    try {
        const user = await UserDB.createUser(request.body);
        const token = issueToken(user.userID!);
        response.status(200).json({ token });
    } catch (err) {
        response.status(500).json(err);
    }
}));