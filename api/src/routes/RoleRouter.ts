import express, {Request, Response} from 'express';
import {AuthMiddleware} from '../middleware/AuthMiddleware';
import {capture} from "../helpers/ErrorHelper";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {courseRole} from "../../../models/enums/courseRoleEnum";
import {requirePermission} from "../helpers/PermissionHelper";
import {PermissionEnum} from "../../../models/enums/permissionEnum";
import {getEnum} from '../../../models/enums/enumHelper';
import {CourseUser} from '../../../models/api/CourseUser';
import {UserDB} from "../database/UserDB";
import {globalRole} from "../../../models/enums/globalRoleEnum";
import {User} from "../../../models/api/User";

export const roleRouter = express.Router();

// Authentication is required for all endpoints
roleRouter.use(AuthMiddleware.requireAuth);

/**
 * Set the role of a user in a course
 * - requirements:
 *  - manage user role permission
 */
roleRouter.put('/course/:courseID/user/:userID/:role', capture(async(request : Request, response : Response) => {
    const currentUserID : string = await getCurrentUserID(request);
    const courseID : string = request.params.courseID;
    const userID : string = request.params.userID;
    const role : string = request.params.role;

    // Require manage user role permission
    await requirePermission(currentUserID, PermissionEnum.manageUserRole, courseID);

    const courseUser : CourseUser = await CourseRegistrationDB.updateRole({
        userID,
        courseID,
        courseRole : getEnum(courseRole, role)
    });
    response.status(200).send(courseUser);
}));

/**
 * Set role of a user globally
 * - requirements:
 *  - manage user role permission
 */
roleRouter.put('/user/:userID/:role', capture(async(request : Request, response : Response) => {
    const currentUserID : string = await getCurrentUserID(request);
    const userID : string = request.params.userID;
    const globalRole : globalRole = request.params.role as globalRole;

    // require manage user role permission
    await requirePermission(currentUserID, PermissionEnum.manageUserRole);

    const user : User = await UserDB.updateUser({
        userID,
        globalRole
    });

    response.status(200).send(user);
}));