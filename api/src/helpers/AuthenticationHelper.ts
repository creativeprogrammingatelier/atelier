import { Request } from 'express'
import jwt from 'jsonwebtoken';

import { AUTHSECRETKEY, TOKEN_EXPIRATION } from '../lib/constants';

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

/** Error thrown if no token is provided with a request */
export class UnauthorizedError { }

/** Get the `userID` of the user making the request */
export async function getCurrentUserID(request: Request) {
    const token = getToken(request);
    if (token !== undefined) {
        const props = await verifyToken(token);
        return (props as { userID: string }).userID;
    } else {
        throw new UnauthorizedError();
    }
}