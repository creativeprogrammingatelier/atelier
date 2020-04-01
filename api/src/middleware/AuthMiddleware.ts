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
import { CourseRole } from '../../../models/enums/CourseRoleEnum';
import { GlobalRole } from '../../../models/enums/GlobalRoleEnum';
import { getEnum } from '../../../models/enums/EnumHelper';

export class AuthMiddleware {
    /** Middleware function that will refresh tokens in cookies */
    static refreshCookieToken: RequestHandler = captureNext(async (request, response, next) => {
        if (request.cookies.atelierToken) {
            try {
                const token = await verifyToken<{ userID: string }>(request.cookies.atelierToken);
                // The JWT expiration is stored in seconds, Date.now() in milliseconds
                if (token.iat * 1000 + 600000 < Date.now()) {
                    await setTokenCookie(response, token.userID);
                }
            } catch (err) {
                // Ignore AuthErrors, if auth is required for the route, 
                // it will be handled in requireAuth
                if (!(err instanceof AuthError)) {
                    throw err;
                }
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
            await verifyToken(token);
            next();
		}
    });
    
    /** 
     * Middleware function that requires the user to have a specified role,
     * implies `requireAuth`
     * @param inCourse default is false. if set to true, check the users courseRole instead of globalRole
     * this is needed because there is no way to infer with certainty the type of array presented as input.
     */
    static requireGlobalRole(roles: GlobalRole[], inCourse = false): RequestHandler {
        const handler: RequestHandler = captureNext(async (request, response, next) => {
            const userID : string = await getCurrentUserID(request);
            const user : User = await UserDB.getUserByID(userID);
            const role = getEnum(GlobalRole, user.permission.globalRole);
            if (roles.includes(role)) {
                next();
            } else {
                next(new AuthError("role.notAllowed", "You're not qualified to access this information."));
            }
        });

        return async (req, res, next) => 
            this.requireAuth(req, res, (err?) => err ? next(err) : handler(req, res, next));
    }
    static requireCourseRole(roles: CourseRole[], inCourse = false): RequestHandler {
        const handler: RequestHandler = captureNext(async (request, response, next) => {
            const userID : string = await getCurrentUserID(request);
            const user : User = await UserDB.getUserByID(userID);
            try {
                const role = getEnum(CourseRole, user.permission.courseRole!)
                if (!roles.includes(role)){
                    throw new Error();
                }
            } catch (e) {
                next(new AuthError("role.notAllowed", "You're not qualified to access this information."));
            }
            next();
             
        });

        return async (req, res, next) => 
            this.requireAuth(req, res, (err?) => err ? next(err) : handler(req, res, next));
    }

}