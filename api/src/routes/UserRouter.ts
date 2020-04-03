/**
 * Api routes relating to user information
 */

import express, {Request, Response} from "express";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {UserDB} from "../database/UserDB";
import {User} from "../../../models/api/User";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {capture} from "../helpers/ErrorHelper";
import {requirePermission, requirePermissions} from "../helpers/PermissionHelper";
import {PermissionEnum} from "../../../models/enums/PermissionEnum";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import { CourseUser } from "../../../models/api/CourseUser";
import {removePermissionsCourseUser, removePermissionsUser} from "../helpers/APIFilterHelper";

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

	const users : User[] = (await UserDB.getAllUsers());
	response.status(200).send(users);
}));

/**
 * Get users of a course
 * - requirements:
 *  - either viewAllUserProfiles, manageUserPermissionsManager or manageUserPermissionsView
 */
userRouter.get('/course/:courseID', capture(async(request: Request, response : Response) => {
	const currentUserID : string = await getCurrentUserID(request);
	const courseID : string = request.params.courseID;

	// Either of these 3 permissions should be set. In this case managing user permissions
	// implies permission to view all users.
	await requirePermissions(currentUserID, [
		PermissionEnum.viewAllUserProfiles,
		PermissionEnum.manageUserPermissionsManager,
		PermissionEnum.manageUserPermissionsView
	], courseID, true);

	const users : CourseUser[] = (await CourseRegistrationDB.getEntriesByCourse(courseID));
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


/** ---------- PUT REQUESTS ---------- */
/** Set details for current user */
userRouter.put('/', capture(async(request : Request, response : Response) => {
	const currentUserID : string = await getCurrentUserID(request);
	const updatedEmail : string | undefined = request.body.email;
	const updatedName : string | undefined = request.body.name;

	const user : User = await UserDB.updateUser({
		userID : currentUserID,
		email : updatedEmail,
		userName : updatedName
	});
	response.status(200).send(user);
}));