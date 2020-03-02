import { Request, Response, CookieOptions } from 'express'
import jwt from 'jsonwebtoken';

import { AUTHSECRETKEY, TOKEN_EXPIRATION } from '../lib/constants';
import { config } from '../helpers/ConfigurationHelper';

/** Error that gets thrown when the user is not authorized or authenticated */
export class AuthError extends Error {
    reason: string
    constructor(reason: string, message: string) {
        super(message);
        this.reason = reason;
    }
}

interface TokenProps {
    userID: string, 
    iat: number, 
    exp: number
}

/** Issue a new token for a user */
export function issueToken(userID: string, expiresIn: string | number = TOKEN_EXPIRATION) {
    return jwt.sign({ userID }, AUTHSECRETKEY, { expiresIn });
}

/** Asynchronously verify a token */
export const verifyToken = (token: string, time?: number) => 
    new Promise((resolve: (props: TokenProps) => void, reject: (err: jwt.VerifyErrors) => void) =>
        jwt.verify(
            token, 
            AUTHSECRETKEY, 
            { clockTimestamp: time }, 
            (err, props) => 
                err ? reject(err) : resolve(props as TokenProps)
        )
    );

/** Retrieve the JWT token from request headers */
export function getToken(request: Request) {
    return request.cookies.atelierToken?.trim() ||
        request.headers?.authorization?.replace("Bearer ", "")?.trim();
}

/** Get the `userID` of the user making the request */
export async function getCurrentUserID(request: Request) {
    const token = getToken(request);
    if (token !== undefined) {
        const props = await verifyToken(token);
        return props.userID;
    } else {
        throw new AuthError("token.notProvided", "No token was provided with this request. You're probably not logged in.");
    }
}

export async function setTokenCookie(response: Response, userID: string) {
    const options: CookieOptions = { 
        secure: config.env === "production",
        sameSite: "strict",
        path: "/api"
    };
    const token = issueToken(userID);
    const exp = (await verifyToken(token)).exp;
    return response
        .cookie("atelierTokenExp", exp, options)
        .cookie("atelierToken", issueToken(userID), { ...options, httpOnly: true });
}

export function clearTokenCookie(response: Response) {
    return response.clearCookie("atelierTokenExp").clearCookie("atelierToken");
}