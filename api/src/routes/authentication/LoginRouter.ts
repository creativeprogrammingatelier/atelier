import express from "express";

import {issueToken, AuthError} from "../../helpers/AuthenticationHelper";
import {capture} from "../../helpers/ErrorHelper";

import {UserDB} from "../../database/UserDB";
import {User} from "../../../../models/database/User";

export const loginRouter = express.Router();

/** Login endpoint, returns a token to use for subsequent requests */
loginRouter.post("/login", capture(async (request, response) => {
    if (!("username" in request.body && "password" in request.body))
        throw new AuthError("credentials.missing", "Missing username or password");
    return UserDB.loginUser(
        request.body as { email: string; password: string; },
        // Success
        userID => {
            const token = issueToken(userID);
            response.status(200).json({token});
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
loginRouter.post("/register", capture(async(request, response) => {
    const user = await UserDB.createUser(request.body as User);
    const token = issueToken(user.ID);
    response.status(200).json({token});
}));
