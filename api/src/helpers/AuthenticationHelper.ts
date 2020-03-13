console.log("started", new Date())

import { Request, Response, CookieOptions } from 'express'
import jwt from 'jsonwebtoken';

import { AUTHSECRETKEY, TOKEN_EXPIRATION } from '../lib/constants';
import { config } from '../helpers/ConfigurationHelper';
console.log("imported", new Date())
/** Error that gets thrown when the user is not authorized or authenticated */
export class AuthError extends Error {
    reason: string
    constructor(reason: string, message: string) {
        super(message);
        this.reason = reason;
    }
}

interface TokenProps {
    iat: number, 
    exp: number
}

/** Issue a new token for a user */
export function issueToken(userID: string, expiresIn: string | number = TOKEN_EXPIRATION) {
    return jwt.sign({ userID }, AUTHSECRETKEY, { expiresIn });
}

/** Decode a token without verifying its validity */
export const decodeToken = <T>(token: string) => 
    jwt.decode(token) as TokenProps & T;

/** Asynchronously verify a token */
export const verifyToken = <T>(token: string, secretOrKey = AUTHSECRETKEY, options?: jwt.VerifyOptions) => 
    new Promise((resolve: (props: TokenProps & T) => void, reject: (err: Error) => void) => 
        jwt.verify(
            token, 
            secretOrKey, 
            options, 
            (err, props) => {
                if (err) {
                    if (err instanceof jwt.TokenExpiredError) {
                        reject(new AuthError("token.expired", "Your token is expired. Please log in again."));
                    } else if (err instanceof jwt.JsonWebTokenError) {
                        reject(new AuthError("token.invalid", "An invalid token was provided. Please try logging in again."));
                    } else {
                        reject(err);
                    }
                } else {
                    resolve(props as TokenProps & T);
                } 
            })
    );

/** Retrieve the JWT token from request headers */
export function getToken(request: Request) {
    return request.cookies?.atelierToken?.trim() ||
        request.headers?.authorization?.replace("Bearer ", "")?.trim();
}

/** Get the `userID` of the user making the request */
export async function getCurrentUserID(request: Request) {
    const token = getToken(request);
    if (token !== undefined) {
        const props = await verifyToken<{ userID: string }>(token);
        return props.userID;
    } else {
        throw new AuthError("token.notProvided", "No token was provided with this request. You're probably not logged in.");
    }
}

export async function setTokenCookie(response: Response, userID: string) {
    const options: CookieOptions = { 
        secure: config.env === "production",
        sameSite: "strict"
    };
    const token = issueToken(userID);
    const exp = (await verifyToken(token)).exp;
    return response
        .cookie("atelierTokenExp", exp, options)
        .cookie("atelierToken", issueToken(userID), { ...options, httpOnly: true, path: "/api" });
}

export function clearTokenCookie(response: Response) {
    return response.clearCookie("atelierTokenExp").clearCookie("atelierToken");
}