import express, {Request, Response} from "express";

import {CourseInvite} from "../../../models/api/Invite";
import {CourseRole} from "../../../models/enums/CourseRoleEnum";
import {PermissionEnum} from "../../../models/enums/PermissionEnum";

import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {capture} from "../helpers/ErrorHelper";
import {requirePermission} from "../helpers/PermissionHelper";

import {CourseInviteDB} from "../database/CourseInviteDB";
import {AuthMiddleware} from "../middleware/AuthMiddleware";

/**
 * Api routes relating to an invite
 */

export const inviteRouter = express.Router();
inviteRouter.use(AuthMiddleware.requireAuth);

// ---------- GET REQUESTS ----------

/**
 * Get invites of a user for a course
 */
inviteRouter.get("/course/:courseID/all", capture(async(request: Request, response: Response) => {
	const currentUserID: string = await getCurrentUserID(request);
	const courseID: string = request.params.courseID;
	
	// Link require manageUserRegistration
	await requirePermission(currentUserID, PermissionEnum.manageUserRegistration, courseID);
	
	const invites: CourseInvite[] = await CourseInviteDB.filterInvite({
		creatorID: currentUserID,
		courseID
	});
	
	const studentInvites: CourseInvite[] = invites.filter((invite: CourseInvite) => invite.joinRole === CourseRole.student);
	const taInvites: CourseInvite[] = invites.filter((invite: CourseInvite) => invite.joinRole === CourseRole.TA);
	const teacherInvites: CourseInvite[] = invites.filter((invite: CourseInvite) => invite.joinRole === CourseRole.teacher);
	
	response.status(200).send({
		student: studentInvites.length > 0 ? studentInvites[0].inviteID : undefined,
		TA: taInvites.length > 0 ? taInvites[0].inviteID : undefined,
		teacher: teacherInvites.length > 0 ? teacherInvites[0].inviteID : undefined
	});
}));

/**
 * Get invite link to join a course with a certain role.
 */
inviteRouter.get("/course/:courseID/role/:role", capture(async(request: Request, response: Response) => {
	const currentUserID: string = await getCurrentUserID(request);
	const role: CourseRole = request.params.role as CourseRole;
	const courseID: string = request.params.courseID;
	
	// Link require manageUserRegistration
	await requirePermission(currentUserID, PermissionEnum.manageUserRegistration, courseID);
	
	const invites: CourseInvite[] = await CourseInviteDB.filterInvite({
		creatorID: currentUserID,
		courseID: request.params.courseID,
		joinRole: role
	});
	
	if (invites.length > 0) {
		response.status(200).send(invites[0]);
	} else {
		const invite: CourseInvite = await CourseInviteDB.addInvite({
			creatorID: currentUserID,
			courseID: request.params.courseID,
			type: "",
			joinRole: role
		});
		response.status(200).send(invite);
	}
}));

// ---------- DELETE REQUESTS ----------
/** Delete a link of a user
 */
inviteRouter.delete("/course/:courseID/role/:role", capture(async(request: Request, response: Response) => {
	const courseID: string = request.params.courseID;
	const role: string = request.params.role;
	const currentUserID: string = await getCurrentUserID(request);
	
	const courseInvites: CourseInvite[] = await CourseInviteDB.filterInvite({
		courseID,
		creatorID: currentUserID,
		joinRole: role as CourseRole
	});
	
	await Promise.all(courseInvites.map((courseInvite: CourseInvite) =>
		CourseInviteDB.deleteInvite(courseInvite.inviteID))
	);
	
	response.status(200).send(courseInvites);
}));


