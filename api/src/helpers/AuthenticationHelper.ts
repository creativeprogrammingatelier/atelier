import { Request } from 'express'
import jwt from 'jsonwebtoken';

import { AUTHSECRETKEY } from '../lib/constants';

/** Issue a new token for a user */
export function issueToken(userID: string) {
    const token: string = jwt.sign({ userID }, AUTHSECRETKEY, {
        expiresIn: '1400h'
    });
    return token;
}

/** Asynchronously verify a token */
export const verifyToken = (token: string) => 
    new Promise((resolve: (props: string | object) => void, reject: (err: jwt.VerifyErrors) => void) =>
        jwt.verify(token, AUTHSECRETKEY, (err, props) => err ? reject(err) : resolve(props))
    );

/** Error thrown if no token is provided with a request */
export class UnauthorizedError { }

/** Get the `userID` of the user making the request */
export async function getCurrentUserID (request: Request) {
    const token = request.headers?.authorization;
    if (token !== undefined) {
        const props = await verifyToken(token);
        return (props as { userID: string }).userID;
    } else {
        throw new UnauthorizedError();
    }
}