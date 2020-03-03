import { Request } from 'express'
import jwt from 'jsonwebtoken';

import { AUTHSECRETKEY, TOKEN_EXPIRATION } from '../lib/constants';

/** Error that gets thrown when the user is not authorized or authenticated */
export class AuthError extends Error {
    reason: string
    constructor(reason: string, message: string) {
        super(message);
        this.reason = reason;
    }
}

/** Issue a new token for a user */
export function issueToken(userID: string, expiresIn: string | number = TOKEN_EXPIRATION) {
    return jwt.sign({ userID }, AUTHSECRETKEY, { expiresIn });
}

/** Asynchronously verify a token */
export const verifyToken = (token: string, time?: number) => 
    new Promise((resolve: (props: string | object) => void, reject: (err: jwt.VerifyErrors) => void) =>
        jwt.verify(token, AUTHSECRETKEY, { clockTimestamp: time }, (err, props) => err ? reject(err) : resolve(props))
    );

/** Retrieve the JWT token from request headers */
export function getToken(request: Request) {
    return request.headers?.authorization
        ?.replace("Bearer ", "")
        ?.trim();
}

/** Get the `userID` of the user making the request */
export async function getCurrentUserID(request: Request) {
    const token = getToken(request);
    if (token !== undefined) {
        const props = await verifyToken(token);
        return (props as { userID: string }).userID;
    } else {
        throw new AuthError("token.notProvided", "No token was provided with this request. You're probably not logged in.");
    }
}