/**
 * Api routes relating to user information
 */

import express, {Response, Request} from "express";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import {UserDB} from "../database/UserDB";
import {User} from "../../../models/api/User";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {capture} from "../helpers/ErrorHelper";
import {getGlobalRole, requireRole} from "../helpers/PermissionHelper";

export const userRouter = express.Router();

// Authentication is required for all endpoints
userRouter.use(AuthMiddleware.requireAuth);

/**
 * Get a specific user
 * - possible for admin and own user
 */
userRouter.get('/:userID', capture(async(request : Request, response : Response) => {
	const userID : string = request.params.userID;
	const currentUserID : string = await getCurrentUserID(request);
	const user : User = await UserDB.getUserByID(userID);
	await requireRole({userID : currentUserID, globalRoles : ["admin"], users: [userID]});
	response.status(200).send(user);
}));

/**
 * Get current user
 */
userRouter.get('/', capture(async(request : Request, response : Response) => {
	const userID : string = await getCurrentUserID(request);
	const user : User = await UserDB.getUserByID(userID);
	response.status(200).send(user);
}));
