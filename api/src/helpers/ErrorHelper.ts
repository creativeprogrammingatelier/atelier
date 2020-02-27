import { Request, Response, RequestHandler, NextFunction } from 'express';

/** 
 * Catches promise rejections and errors thrown in a request handler and handles them with the next function.
 * Although catch would be the more sensible name for this, it's a reserved keyword. It's named capture, because
 * that has a close enough meaning and starts with the same two letters, aiding in autocompletion. 
 * 
 * @example
 * router.get('/', capture(async (request, response) => {
 *     const res = await callThatMayFail();
 *     response.status(200).send(res);
 * }));
 * 
 * // Handle the promise rejections and other errors
 * router.use((err, req, res, next) => {
 *     response.status(500).send(err);
 * });
 */
export function capture<T>(func: (request: Request, response: Response) => Promise<T>): RequestHandler {
    return captureNext((request, response, _next) => func(request, response));
}

/** Does the same as `capture` for handlers using the `next` function */
export function captureNext<T>(func: (request: Request, response: Response, next: NextFunction) => Promise<T>) : RequestHandler {
    return async (request, response, next) => {
        try {
            return await func(request, response, next);
        } catch (err) {
            next(err);
        }
    }
}