/**
 * Middleware for checking user authentication and authorization
 * Author: Andrew Heath, Arthur Rump
 * Created: 13/08/19
 */

import jwt from 'jsonwebtoken';
import { getCurrentUserID, verifyToken, getToken } from '../helpers/AuthenticationHelper';
import { RequestHandler } from 'express';
import { UserDB } from '../database/UserDB';

export class AuthMiddleware {
    /** Middleware function that will block all non-authenticated requests */
	static requireAuth: RequestHandler = async (req, res, next) => {
		const token = getToken(req);
		if (!token) {
			res.status(401).json({ error: "token.notProvided" });
		} else {
            try {
                await verifyToken(token);
                next();
            } catch (err) {
                if (err instanceof jwt.TokenExpiredError) {
                    res.status(401).json({ error: "token.expired", expiredAt: err.expiredAt });
                } else if (err instanceof jwt.NotBeforeError) {
                    res.status(401).json({ error: "token.notBefore", date: err.date });
                } else {
                    throw err;
                }
            }
		}
    }
    
    /** 
     * Middleware function that requires the user to have a specified role,
     * implies `requireAuth`
     */
    static requireRole(roles: string[]): RequestHandler {
        const handler: RequestHandler = async (req, res, next) => {
            const userID = await getCurrentUserID(req);
            const user = await UserDB.getUserByID(userID);
            if (roles.includes(user.role!)) {
                next();
            } else {
                res.status(401).json({ error: "role.notAllowed" });
            }
        }

        return async (req, res, next) => 
            this.requireAuth(req, res, (err?) => err ? next(err) : handler(req, res, next));
    }
}