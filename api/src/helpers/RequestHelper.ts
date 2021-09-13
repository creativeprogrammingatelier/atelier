import {Request} from "express";
import {ParamsDictionary} from "express-serve-static-core";

/**
 * Modified Express Request type with reoredered type arguments, such that the
 * first argument is the type of the request body and the second is the type
 * of the result body. This prevents having to type and import ParamsDictionary
 * every time we want to set the body types.
 */
export type RequestB<ReqBody = unknown, ResBody = unknown> = Request<ParamsDictionary, ResBody, ReqBody>
