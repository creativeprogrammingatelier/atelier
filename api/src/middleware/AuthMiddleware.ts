/**
 * Middleware for checking user authentication and authorization
 * Author: Andrew Heath, Arthur Rump
 * Created: 13/08/19
 */

import jwt from 'jsonwebtoken';
import { getCurrentUserID, verifyToken, getToken, AuthError, setTokenCookie } from '../helpers/AuthenticationHelper';
import { RequestHandler } from 'express';
import { UserDB } from '../database/UserDB';
import { captureNext } from '../helpers/ErrorHelper';
import {User} from "../../../models/api/User";

export class AuthMiddleware {
    /** Middleware function that will refresh tokens in cookies */
    static refreshCookieToken: RequestHandler = captureNext(async (request, response, next) => {
        if (request.cookies.atelierToken) {
            const token = await verifyToken<{ userID: string }>(request.cookies.atelierToken);
            // The JWT expiration is stored in seconds, Date.now() in milliseconds
            if (token.iat * 1000 + 600000 < Date.now()) {
                await setTokenCookie(response, token.userID);
            }
        }
        next();
    });

    /** Middleware function that will block all non-authenticated requests */
	static requireAuth: RequestHandler = captureNext(async (request, _response, next) => {
		const token = getToken(request);
		if (!token) {
			next(new AuthError("token.notProvided", "No token was provided with this request. You're probably not logged in."));
		} else {
            try {
                await verifyToken(token);
                next();
            } catch (err) {
                if (err instanceof jwt.TokenExpiredError) {
                    next(new AuthError("token.expired", "Your token is expired. Please log in again."));
                } else if (err instanceof jwt.JsonWebTokenError) {
                    next(new AuthError("token.invalid", "An invalid token was provided. Please try logging in again."));
                } else {
                    next(err);
                }
            }
		}
    });
    
    /** 
     * Middleware function that requires the user to have a specified role,
     * implies `requireAuth`
     */
    static requireRole(roles: string[]): RequestHandler {
        const handler: RequestHandler = captureNext(async (request, response, next) => {
            const userID : string = await getCurrentUserID(request);
            const user : User = await UserDB.getUserByID(userID);
            if (roles.includes(user.permission.role)) {
                next();
            } else {
                next(new AuthError("role.notAllowed", "You're not qualified to access this information."));
            }
        });

        return async (req, res, next) => 
            this.requireAuth(req, res, (err?) => err ? next(err) : handler(req, res, next));
    }
}