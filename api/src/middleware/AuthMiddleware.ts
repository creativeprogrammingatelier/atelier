import {RequestHandler} from "express";
import {verifyToken, getToken, AuthError, setTokenCookie} from "../database/helpers/AuthenticationHelper";
import {captureNext} from "../database/helpers/ErrorHelper";

/**
 * Middleware for checking user authentication and authorization
 * Author: Andrew Heath, Arthur Rump
 * Created: 13/08/19
 */
export class AuthMiddleware {
	/** Middleware function that will refresh tokens in cookies */
	static refreshCookieToken: RequestHandler = captureNext(async(request, response, next) => {
		if (request.cookies.atelierToken) {
			try {
				const token = await verifyToken<{userID: string}>(request.cookies.atelierToken);
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
	static requireAuth: RequestHandler = captureNext(async(request, _response, next) => {
		const token = getToken(request);
		if (!token) {
			next(new AuthError("token.notProvided", "No token was provided with this request. You're probably not logged in."));
		} else {
			await verifyToken(token);
			next();
		}
	});
}