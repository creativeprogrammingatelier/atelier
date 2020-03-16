import express, {Request, Response} from 'express';
import {AuthMiddleware} from '../middleware/AuthMiddleware';
import {capture} from "../helpers/ErrorHelper";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {courseRole} from "../../../models/enums/courseRoleEnum";
import {CourseRegistrationOutput} from "../../../models/database/CourseRegistration";
import {getGlobalPermissions, requirePermission} from "../helpers/PermissionHelper";
import {containsPermission, PermissionEnum} from "../../../models/enums/permissionEnum";

export const roleRouter = express.Router();

// Authentication is required for all endpoints
roleRouter.use(AuthMiddleware.requireAuth);

/**
 * Set the role of a user
 * - requirements:
 *  - manage user role permission
 */
roleRouter.post('/course/:courseID/user/:userID/:role', capture(async(request : Request, response : Response) => {
    const currentUserID : string = await getCurrentUserID(request);
    const courseID : string = request.params.courseID;
    const userID : string = request.params.userID;
    const role : string = request.params.role

    // Require manage user role permission
    await requirePermission(currentUserID, PermissionEnum.manageUserRole, courseID);

    const courseRegistrationOutput : CourseRegistrationOutput = await CourseRegistrationDB.updateRole({
        userID : userID,
        courseID : courseID,
        role : role as courseRole
    });
    response.status(200).send(courseRegistrationOutput);
}));