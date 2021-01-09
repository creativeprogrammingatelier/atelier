import express, {Request, Response} from "express";

import {CourseUser} from "../../../models/api/CourseUser";
import {User} from "../../../models/api/User";
import {PermissionEnum} from "../../../models/enums/PermissionEnum";

import {getCurrentUserID} from "../database/helpers/AuthenticationHelper";
import {capture} from "../database/helpers/ErrorHelper";
import {requirePermission, requirePermissions} from "../database/helpers/PermissionHelper";

import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {UserDB} from "../database/UserDB";
import {AuthMiddleware} from "../middleware/AuthMiddleware";

/**
 * Api routes relating to user information
 */

export const userRouter = express.Router();
userRouter.use(AuthMiddleware.requireAuth);

// ---------- GET REQUESTS ----------

/**
 * Get current user
 */
userRouter.get("/", capture(async(request: Request, response: Response) => {
	const userID: string = await getCurrentUserID(request);
	const user: User = await UserDB.getUserByID(userID);
	response.status(200).send(user);
}));

/**
 * Get all users
 * - requirements:
 *  - view all user permissions
 */
userRouter.get("/all", capture(async(request: Request, response: Response) => {
	const currentUserID: string = await getCurrentUserID(request);
	
	// Require view all user profiles permission
	await requirePermission(currentUserID, PermissionEnum.viewAllUserProfiles);
	
	const users: User[] = (await UserDB.getAllUsers());
	response.status(200).send(users);
}));

/**
 * Get users of a course
 * - requirements:
 *  - either viewAllUserProfiles, manageUserPermissionsManager or manageUserPermissionsView
 */
userRouter.get("/course/:courseID", capture(async(request: Request, response: Response) => {
	const currentUserID: string = await getCurrentUserID(request);
	const courseID: string = request.params.courseID;
	
	// Either of these 3 permissions should be set. In this case managing user permissions
	// implies permission to view all users.
	await requirePermissions(currentUserID, [
		PermissionEnum.viewAllUserProfiles,
		PermissionEnum.manageUserPermissionsManager,
		PermissionEnum.manageUserPermissionsView
	], courseID, true);
	
	const users: CourseUser[] = (await CourseRegistrationDB.getEntriesByCourse(courseID));
	response.status(200).send(users);
}));

/**
 * Get a specific user
 * - requirements:
 *  - view all users (if you are not the user)
 */
userRouter.get("/:userID", capture(async(request: Request, response: Response) => {
	const userID: string = request.params.userID;
	const currentUserID: string = await getCurrentUserID(request);
	const user: User = await UserDB.getUserByID(userID);
	
	console.log(`Querying user ${currentUserID}`);
	if (userID !== currentUserID) {
		console.log("checking whether user has permission to get user profiles");
		await requirePermission(currentUserID, PermissionEnum.viewAllUserProfiles);
	}
	
	response.status(200).send(user);
}));

/**
 * Get a user within the context of a course
 */
userRouter.get("/:userID/course/:courseID/", capture(async(request: Request, response: Response) => {
    const currentUserID: string = await getCurrentUserID(request);
    const userID: string = request.params.userID;
	const courseID: string = request.params.courseID;
	
	// Either of these 3 permissions should be set. In this case managing user permissions
	// implies permission to view all users.
	await requirePermissions(currentUserID, [
		PermissionEnum.viewAllUserProfiles,
		PermissionEnum.manageUserPermissionsManager,
		PermissionEnum.manageUserPermissionsView
	], courseID, true);
	
	const user = await CourseRegistrationDB.getSingleEntry(courseID, userID);
	response.status(200).send(user);
}));

// ---------- PUT REQUESTS ----------

/** Set details for current user */
userRouter.put("/", capture(async(request: Request, response: Response) => {
	const currentUserID: string = await getCurrentUserID(request);
	const updatedEmail: string | undefined = request.body.email;
    const updatedName: string | undefined = request.body.name;
    const updatedResearchAllowed: boolean | undefined = request.body.researchAllowed;
	
	const user: User = await UserDB.updateUser({
		userID: currentUserID,
		email: updatedEmail,
        userName: updatedName,
        researchAllowed: updatedResearchAllowed
	});
	response.status(200).send(user);
}));