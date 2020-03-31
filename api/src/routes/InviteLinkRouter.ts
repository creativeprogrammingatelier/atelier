import {capture} from "../helpers/ErrorHelper";
import express, {Request, Response} from "express";
import {AuthError, getCurrentUserID} from "../helpers/AuthenticationHelper";
import {CourseInvite} from "../../../models/api/Invite";
import {CourseInviteDB} from "../database/CourseInviteDB";
import {CourseUser} from "../../../models/api/CourseUser";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {NotFoundDatabaseError} from "../database/DatabaseErrors";


export const inviteLinkRouter = express.Router();

// Authentication is required for all endpoints
// inviteLinkRouter.use(AuthMiddleware.requireAuth);

/**
 * Uses invite link to join user in a course with a certain role.
 * - User should not be registered in the course yet.
 */
inviteLinkRouter.get("/:inviteID", capture(async(request: Request, response: Response) => {
    console.log(request.params.inviteID);
    const currentUserID : string = await getCurrentUserID(request);
    const invite : CourseInvite[] = await CourseInviteDB.filterInvite({
        inviteID : request.params.inviteID
    });

    // Invite does not exist
    if (invite.length === 0) throw new NotFoundDatabaseError();

    // Get invite
    const courseInvite : CourseInvite = invite[0];

    // Check if user is already enrolled
    const courseID : string = courseInvite.courseID!;
    const enrolledCourses : CourseUser[] = await CourseRegistrationDB.getSubset([courseID], [currentUserID]);
    if (enrolledCourses.length > 0) {
        response.status(200).redirect(`/course/${courseID}`);
        return;
    }

    // Enroll user
    await CourseRegistrationDB.addEntry({
        courseID,
        userID : currentUserID,
        courseRole : courseInvite.joinRole,
    });

    response.status(200).redirect(`/course/${courseID}`);
}));