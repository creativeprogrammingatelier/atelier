/**
 * Api routes relating to an invite
 */

import express, {Request, Response} from "express";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {requirePermission, requireRegistered} from "../helpers/PermissionHelper";
import {capture} from "../helpers/ErrorHelper";
import {CourseInviteDB} from "../database/CourseInviteDB";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {CourseRegistrationOutput} from "../../../models/database/CourseRegistration";
import {CourseInvite} from "../../../models/api/Invite";
import {PermissionEnum} from "../../../models/enums/permissionEnum";
import {courseRole} from "../../../models/enums/courseRoleEnum";

export const inviteRouter = express.Router();

// Authentication is required for all endpoints
inviteRouter.use(AuthMiddleware.requireAuth);

/** ---------- GET REQUESTS ---------- */
/**
 * Get invites of a user for a course
 */
inviteRouter.get('/course/:courseID/all', capture(async(request : Request, response : Response) => {
    const currentUserID : string = await getCurrentUserID(request);
    const courseID : string = request.params.courseID;

    const invites : CourseInvite[] = await CourseInviteDB.filterInvite({
        creatorID : currentUserID,
        courseID
    });

    const studentInvites : CourseInvite[] = invites.filter((invite : CourseInvite) => invite.joinRole === courseRole.student);
    const taInvites : CourseInvite[] = invites.filter((invite : CourseInvite) => invite.joinRole === courseRole.TA);
    const teacherInvites : CourseInvite[] = invites.filter((invite : CourseInvite) => invite.joinRole === courseRole.teacher);

    response.status(200).send({
        student : studentInvites.length > 0 ? studentInvites[0].inviteID : undefined,
        TA : taInvites.length > 0 ? taInvites[0].inviteID : undefined,
        teacher : teacherInvites.length > 0 ? teacherInvites[0].inviteID : undefined
    });
}));

/**
 * Get invite link to join a course with a certain role.
 */
inviteRouter.get('/course/:courseID/role/:role', capture( async(request : Request, response : Response) => {
    const currentUserID : string = await getCurrentUserID(request);
    const role : courseRole = request.params.role as courseRole;
    const courseID : string = request.params.courseID;

    // Link require manageUserRegistration
    await requirePermission(currentUserID, PermissionEnum.manageUserRegistration, courseID);

    const invites : CourseInvite[] = await CourseInviteDB.filterInvite({
        creatorID : currentUserID,
        courseID : request.params.courseID,
        joinRole : role
    });

    if (invites.length > 0) {
        response.status(200).send(invites[0]);
    } else {
        const invite : CourseInvite = await CourseInviteDB.addInvite({
            creatorID : currentUserID,
            courseID : request.params.courseID,
            type : '',
            joinRole : role,
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
        role : courseInvite.joinRole,
    });

    response.status(200).redirect(`/course/${courseID}`);
}));

/** ---------- DELETE REQUESTS ---------- */
/** Delete a link of a user */
inviteRouter.delete("/course/:courseID/role/:role", capture(async(request : Request, response : Response) => {
    const courseID : string = request.params.courseID;
    const role : string = request.params.role;
    const currentUserID : string = await getCurrentUserID(request);

    const courseInvites : CourseInvite[] = await CourseInviteDB.filterInvite({
        courseID,
        creatorID : currentUserID,
        joinRole : role as courseRole
    });

    await Promise.all(courseInvites.map((courseInvite : CourseInvite) =>
        CourseInviteDB.deleteInvite(courseInvite.inviteID))
    );

    response.status(200).send(courseInvites);
}));


