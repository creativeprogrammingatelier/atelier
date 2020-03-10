/**
 * Api routes relating to comments
 */

import express, {Request, Response} from 'express';
import {capture} from "../helpers/ErrorHelper";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {CourseRegistrationOutput} from "../../../models/database/CourseRegistration";
import {AuthError, getCurrentUserID} from "../helpers/AuthenticationHelper";
import {Permission} from "../../../models/api/Permission";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {
    getCoursePermissions,
    getGlobalPermissions,
    requirePermission,
    requireRegistered
} from "../helpers/PermissionHelper";
import {containsPermission, PermissionEnum} from "../../../enums/permissionEnum";

export const permissionRouter = express.Router();
permissionRouter.use(AuthMiddleware.requireAuth);

/** ---------- GET REQUESTS ---------- */

/**
 * Get global permissions of user
 */
permissionRouter.get('/', capture(async(request : Request, response : Response) => {
    const userID : string = await getCurrentUserID(request);
    const permissions : number = await getGlobalPermissions(userID);
    response.status(200).send({permissions : permissions } );
}));

/** DEBUGGING PATH
 * Get all permissions.
 */
permissionRouter.get('/all',capture(async(request : Request, response : Response) => {
    const allPermissions = await CourseRegistrationDB.getAllEntries();
    response.status(200).send(allPermissions);
}));

/**
 * Get user permissions of a course
 * - requirements:
 *  - user is registered in the course
 */
permissionRouter.get('/course/:courseID', capture(async(request :Request, response: Response) => {
    const courseID : string = request.params.courseID;
    const userID : string = await getCurrentUserID(request);

    // User should be registered in the course
    await requireRegistered(userID, courseID);

    const coursePermissions : CourseRegistrationOutput[] = await CourseRegistrationDB.getSubset([courseID], [userID]);
    if (coursePermissions[0] == undefined) throw new AuthError("course.noRegistration", "You don't have permission to view this data");
    const permission : Permission = {
        role : coursePermissions[0].role,
        permissions : coursePermissions[0].permission
    };
    response.status(200).send(permission);
}));

// TODO change permissions
/** ---------- PUT REQUESTS ---------- */
/**
 * {
 *     permission : {
 *         "name" : true(add)/false(remove)
 *     }
 * }
 * return same with all permissions
 */
/**
 * Add user permissions in a course
 * - requirements:
 *  - manageUserPermissionsManager permission
 */
permissionRouter.put('/course/:courseID/user/:userID/', capture(async(request : Request, response : Response) => {
    const currentUserID : string = await getCurrentUserID(request);
    const courseID : string = request.params.courseID;

    // Requires manageUserPermissionsManage
    await requirePermission(currentUserID, PermissionEnum.manageUserPermissionsManager, courseID);

    const setPermissions = request.body.permissions;
    const addPermissions : number = 0;
    const removePermissions : number = 0;
    const userID : string = request.params.userID;

    // TODO read setPermissions true/false to add/remove permissions. use enum as dictionary

    console.log("Set permissions: " + setPermissions);
    console.log(Object.keys(setPermissions));
    // await CourseRegistrationDB.addPermission({
    //     courseID : courseID,
    //     userID : userID,
    //     permission : addPermissions
    // });
    //
    // const courseRegistrationOutput : CourseRegistrationOutput = await CourseRegistrationDB.removePermission({
    //     courseID : courseID,
    //     userID : userID,
    //     permission : removePermissions
    // });

    // TODO convert to { permissions { name => boolean, ..., ... }}
    response.status(200).send({});//courseRegistrationOutput);
}));
