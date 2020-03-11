/**
 * Api routes relating to user information
 */

import express, {Request, Response} from "express";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {UserDB} from "../database/UserDB";
import {User} from "../../../models/api/User";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {capture} from "../helpers/ErrorHelper";
import {requirePermission} from "../helpers/PermissionHelper";
import {PermissionEnum} from "../../../enums/permissionEnum";

export const userRouter = express.Router();

// Authentication is required for all endpoints
userRouter.use(AuthMiddleware.requireAuth);

/**
 * Get all users
 * - requirements:
 *  - view all user permissions
 */
userRouter.get('/all', capture(async(request : Request, response : Response) => {
	const currentUserID : string = await getCurrentUserID(request);

	// Require view all user profiles permission
	await requirePermission(currentUserID, PermissionEnum.viewAllUserProfiles);

	const users : User[] = await UserDB.getAllUsers();
	response.status(200).send(users);
}));

/**
 * Get a specific user
 * - requirements:
 *  - view all users (if you are not the user)
 */
userRouter.get('/:userID', capture(async(request : Request, response : Response) => {
	const userID : string = request.params.userID;
	const currentUserID : string = await getCurrentUserID(request);
	const user : User = await UserDB.getUserByID(userID);

	console.log(`Querying user ${currentUserID}`);
	if (userID !== currentUserID) {
		console.log("checking whether user has permission to get user profiles");
		await requirePermission(currentUserID, PermissionEnum.viewAllUserProfiles);
	}


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
