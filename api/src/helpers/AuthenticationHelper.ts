import {Request, Response, CookieOptions} from 'express';
import jwt from 'jsonwebtoken';

import {AUTHSECRETKEY, TEMPSECRETKEY, TOKEN_EXPIRATION} from '../lib/constants';
import {config} from './ConfigurationHelper';

/** Error that gets thrown when the user is not authorized or authenticated */
export class AuthError extends Error {
	reason: string;

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
  return jwt.sign({userID}, AUTHSECRETKEY, {expiresIn});
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
              reject(new AuthError('token.expired', 'Your token is expired. Please log in again.'));
            } else {
              reject(new AuthError('token.invalid', 'An invalid token was provided. Please try logging in again.'));
            }
          } else {
            resolve(props as TokenProps & T);
          }
        }),
  );

/** Retrieve the JWT token from request headers */
export function getToken(request: Request) {
  return request.cookies?.atelierToken?.trim() ||
		request.headers?.authorization?.replace('Bearer ', '')?.trim();
}

/** Get the `userID` of the user making the request */
export async function getCurrentUserID(request: Request) {
  const token = getToken(request);
  if (token !== undefined) {
    const props = await verifyToken<{userID: string}>(token);
    return props.userID;
  } else {
    throw new AuthError('token.notProvided', 'No token was provided with this request. You\'re probably not logged in.');
  }
}

/** Set cookie headers for a newly generated token */
export async function setTokenCookie(response: Response, userID: string) {
  const options: CookieOptions = {
    secure: config.env === 'production',
    sameSite: 'lax',
  };
  const token = issueToken(userID);
  const exp = (await verifyToken(token)).exp;
  return response
      .cookie('atelierTokenExp', exp, options)
      .cookie('atelierToken', issueToken(userID), {...options, httpOnly: true, path: '/'});
}

/** Set headers to remove the token cookies */
export function clearTokenCookie(response: Response) {
  return response.clearCookie('atelierTokenExp').clearCookie('atelierToken');
}

// Temporary tokens
// These tokens are meant to be used once and within a short time to set a proper token in a cookie
// after logging in across domains. To make this as secure as possible, the tokens are valid for a
// short time and they can be used only once. The latter is not completely guaranteed, but there is
// some invalidation in place to catch most of these. This should prevent an attacker from sniffing
// the temporary token and use it to get another real token besides the one the user gets.

const temporaryTokenExpiration = 20; // seconds

/** A simple class that tracks tokens that have already been used. */
class TokenInvalidator {
    private tokens : Set<string>;
    constructor() {
      this.tokens = new Set();
    }
    checkAndInvalidate(token : string, exp : number) {
      if (this.tokens.has(token)) {
        return false;
      } else {
        this.tokens.add(token);
        setTimeout(() => this.tokens.delete(token), exp * 1000 - Date.now() + 3000);
        return true;
      }
    }
}

/** The single instance of the TokenInvalidator used for temporary tokens. */
const tokenInvalidator = new TokenInvalidator();

/** Issue a temoprary token for login redirects. Valid once for 20 seconds. */
export function issueTemporaryToken(userID: string) {
  return jwt.sign({userID, temporary: true}, TEMPSECRETKEY, {expiresIn: temporaryTokenExpiration});
}

/** Verify that a temporary token is valid and indeed temporary. */
export async function verifyTemporaryToken(token: string) {
  const {userID, temporary, iat, exp} = await verifyToken<{ userID: string, temporary: boolean }>(token, TEMPSECRETKEY);
  if (!temporary || exp - iat > temporaryTokenExpiration) {
    throw new AuthError('token.notTemporary', 'This endpoint requires the use of a temporary token, but a different token was used.');
  }
  if (!tokenInvalidator.checkAndInvalidate(token, exp)) {
    throw new AuthError('token.temporaryInvalidated', 'This temporary token has already been used. Please try logging in again.');
  }
  return userID;
}
