/**
 * Api routes relating to an invite
 */

import express, {Request, Response} from "express";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {requirePermission, requireRegistered} from "../helpers/PermissionHelper";
import {PermissionEnum} from "../../../models/enums/permissionEnum";
import {capture} from "../helpers/ErrorHelper";
import {CourseInvite} from "../../../models/database/CourseInvites";
import {CourseInviteDB} from "../database/CourseInviteDB";
import {CoursePartial} from "../../../models/api/Course";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {CourseRegistrationOutput} from "../../../models/database/CourseRegistration";
import {courseRole} from "../../../models/enums/courseRoleEnum";

export const inviteRouter = express.Router();

// Authentication is required for all endpoints
inviteRouter.use(AuthMiddleware.requireAuth);

/** ---------- GET REQUESTS ---------- */
/**
 * Get invite link to join a course with a certain role.
 * // TODO what permission?
 */
inviteRouter.get('/course/:courseID/role/:role', capture( async(request : Request, response : Response) => {
    console.log("get request");
    const currentUserID : string = await getCurrentUserID(request);

    const invites : CourseInvite[] = await CourseInviteDB.filterInvite({
        creatorID : currentUserID,
        courseID : request.params.courseID,
        joinRole : request.params.role as courseRole
    });

    if (invites.length > 0) {
        console.log(invites[0]);
        response.status(200).send(invites[0]);
    } else {
        const invite : CourseInvite = await CourseInviteDB.addInvite({
            creatorID : currentUserID,
            courseID : request.params.courseID,
            type : '',
            joinRole : request.params.role as courseRole,
        });
        response.status(200).send(invite);
    }
}));
/**
 * Uses invite link to join user in a course with a certain role.
 * - User should not be registered in the course yet.
 */
inviteRouter.get("/:inviteID", capture(async(request: Request, response: Response) => {
    const currentUserID : string = await getCurrentUserID(request);
    const invite : CourseInvite[] = await CourseInviteDB.filterInvite({
        inviteID : request.params.inviteID
    });

    // Invite does not exist
    if (invite.length === 0) throw new Error("Invite not found");

    // Get invite
    const courseInvite : CourseInvite = invite[0];

    // Check if user is already enrolled
    const courseID : string = courseInvite.courseID!;
    const enrolledCourses : CourseRegistrationOutput[] = await CourseRegistrationDB.getSubset([courseID], [currentUserID]);
    if (enrolledCourses.length > 0) {
        response.status(200).redirect(`/course/${courseID}`);
        return;
    }

    // Enroll user
    await CourseRegistrationDB.addEntry({
        courseID,
        userID : currentUserID,
        role : courseInvite.joinRole!,
    });

    response.status(200).redirect(`/course/${courseID}`);
}));


