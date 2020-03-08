/**
 * Api routes relating to comments
 */

import express, { Response, Request } from 'express';
import {capture} from "../helpers/ErrorHelper";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {CourseRegistrationOutput} from "../../../models/database/CourseRegistration";
import {AuthError, getCurrentUserID} from "../helpers/AuthenticationHelper";
import {Permission} from "../../../models/api/Permission";
import {UserDB} from "../database/UserDB";
import {User} from "../../../models/api/User";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {userRouter} from "./UserRouter";
import {requireRole} from "../helpers/PermissionHelper";

export const permissionRouter = express.Router();
permissionRouter.use(AuthMiddleware.requireAuth);

/** ---------- GET REQUESTS ---------- */

/**
 * Get global permissions of user
 */
permissionRouter.get('/', capture(async(request : Request, response : Response) => {
    const userID : string = await getCurrentUserID(request);
    const user : User = await UserDB.getUserByID(userID);
    const permission : Permission = user.permission;
    response.status(200).send(permission);
}));

/**
 * Get all permissions.
 */
permissionRouter.get('/all',capture(async(request : Request, response : Response) => {
    const allPermissions = await CourseRegistrationDB.getAllEntries();
    response.status(200).send(allPermissions);
}));

/**
 * Get user permissions of a course
 */
permissionRouter.get('/course/:courseID', capture(async(request :Request, response: Response) => {
    const courseID : string = request.params.courseID;
    const userID : string = await getCurrentUserID(request);
    const coursePermissions : CourseRegistrationOutput[] = await CourseRegistrationDB.getSubset([courseID], [userID]);
    if (coursePermissions[0] == undefined) throw new AuthError("course.noRegistration", "You don't have permission to view this data");
    const permission : Permission = {
        role : coursePermissions[0].role,
        permissions : coursePermissions[0].permission
    };
    response.status(200).send(permission);
}));

/** ---------- PUT REQUESTS ---------- */

/**
 * Add user permissions in a course
 */
permissionRouter.put('/course/:courseID/user/:userID/add/:permission', capture(async(request : Request, response : Response) => {
    const currentUserID : string = await getCurrentUserID(request);
    await requireRole({userID : currentUserID, globalRoles : ["admin"]});

    const courseID : string = request.params.courseID;
    const userID : string = request.params.userID;
    const permission : number = request.params.permission as unknown as number;
    const courseRegistrationOutput : CourseRegistrationOutput = await CourseRegistrationDB.addPermission({
        courseID : courseID,
        userID : userID,
        permission : permission,
    });
    response.status(200).send(courseRegistrationOutput);
}));

/**
 * Remove user permissions in a course
 */
permissionRouter.delete('/course/:courseID/user/:userID/remove/:permission', capture(async(request : Request, response : Response) => {
    const currentUserID : string = await getCurrentUserID(request);
    await requireRole({userID : currentUserID, globalRoles : ["admin"]});

    const courseID : string = request.params.courseID;
    const userID : string = request.params.userID;
    const permission : number = request.params.permission as unknown as number;
    const courseRegistrationOutput : CourseRegistrationOutput = await CourseRegistrationDB.removePermission({
       courseID : courseID,
       userID : userID,
       permission : permission
    });
    response.status(200).send(courseRegistrationOutput);
}));
