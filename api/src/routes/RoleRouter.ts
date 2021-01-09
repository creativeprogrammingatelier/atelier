import express, {Request, Response} from "express";

import {CourseUser} from "../../../models/api/CourseUser";
import {User} from "../../../models/api/User";
import {CourseRole} from "../../../models/enums/CourseRoleEnum";
import {GlobalRole} from "../../../models/enums/GlobalRoleEnum";
import {PermissionEnum} from "../../../models/enums/PermissionEnum";

import {getCurrentUserID} from "../database/helpers/AuthenticationHelper";
import {getEnum} from "../../../helpers/EnumHelper";
import {capture} from "../database/helpers/ErrorHelper";
import {requirePermission} from "../database/helpers/PermissionHelper";

import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {UserDB} from "../database/UserDB";
import {AuthMiddleware} from "../middleware/AuthMiddleware";

export const roleRouter = express.Router();
roleRouter.use(AuthMiddleware.requireAuth);

/**
 * Set the role of a user in a course
 * - requirements:
 *  - manage user role permission
 */
roleRouter.put("/course/:courseID/user/:userID/:role", capture(async(request: Request, response: Response) => {
	const currentUserID: string = await getCurrentUserID(request);
	const courseID: string = request.params.courseID;
	const userID: string = request.params.userID;
	const role: string = request.params.role;
	
	// Require manage user role permission
	await requirePermission(currentUserID, PermissionEnum.manageUserRole, courseID);
	
	const courseUser: CourseUser = await CourseRegistrationDB.updateRole({
		userID,
		courseID,
		courseRole: getEnum(CourseRole, role)
	});
	response.status(200).send(courseUser);
}));

/**
 * Set role of a user globally
 * - requirements:
 *  - manage user role permission
 */
roleRouter.put("/user/:userID/:role", capture(async(request: Request, response: Response) => {
	const currentUserID: string = await getCurrentUserID(request);
	const userID: string = request.params.userID;
	const globalRole: GlobalRole = request.params.role as GlobalRole;
	
	// require manage user role permission
	await requirePermission(currentUserID, PermissionEnum.manageUserRole);
	
	const user: User = await UserDB.updateUser({
		userID,
		globalRole
	});
	
	response.status(200).send(user);
}));