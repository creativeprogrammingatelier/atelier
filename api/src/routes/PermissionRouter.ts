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
import {getGlobalPermissions, requirePermission, requireRegistered} from "../helpers/PermissionHelper";
import {PermissionEnum} from "../../../models/enums/permissionEnum";
import {UserDB} from "../database/UserDB";
import {User} from "../../../models/api/User";

export const permissionRouter = express.Router();
permissionRouter.use(AuthMiddleware.requireAuth);

/** ---------- GET REQUESTS ---------- */

/**
 * Get global permissions of user
 */
permissionRouter.get('/', capture(async(request : Request, response : Response) => {
    const userID : string = await getCurrentUserID(request);
    const permissions : number = await getGlobalPermissions(userID);
    response.status(200).send({permissions} );
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
    if (coursePermissions[0] === undefined) throw new AuthError("course.noRegistration", "You don't have permission to view this data");
    const permission : Permission = {
        role : coursePermissions[0].role,
        permissions : coursePermissions[0].permission
    };
    response.status(200).send(permission);
}));

/** ---------- PUT REQUESTS ---------- */
function getPermissions(setPermissions : any) {
    let addPermissions = 0;
    let removePermissions = 0;

    const permissions = Object.keys(setPermissions);
    const add : boolean[] = Object.values(setPermissions);

    for (let i = 0; i < permissions.length; i++) {
        const permissionType : PermissionEnum = PermissionEnum[permissions[i] as keyof typeof PermissionEnum];
        if (add[i]) addPermissions |= (1 << permissionType);
        else removePermissions |= (1 << permissionType);
    }

    return [addPermissions, removePermissions];
}

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
    const userID : string = request.params.userID;
    const permissions = getPermissions(setPermissions);


    await CourseRegistrationDB.addPermission({
        courseID,
        userID,
        permission : permissions[0]
    });

    const courseRegistrationOutput : CourseRegistrationOutput = await CourseRegistrationDB.removePermission({
        courseID,
        userID,
        permission : permissions[1]
    });

    // TODO convert to { permissions { name => boolean, ..., ... }}
    response.status(200).send(courseRegistrationOutput);
}));


/**
 * Add user permissions globally
 * - requirements:
 *  - manageUserPermissionsManager permission
 */
permissionRouter.put('/user/:userID/', capture(async(request : Request, response : Response) => {
    const currentUserID : string = await getCurrentUserID(request);

    // Requires manageUserPermissionsManage
    await requirePermission(currentUserID, PermissionEnum.manageUserPermissionsManager);

    const setPermissions = request.body.permissions;
    console.log(setPermissions);
    const userID : string = request.params.userID;
    const permissions = getPermissions(setPermissions);
    console.log(permissions);

    await UserDB.addPermissionsUser(userID, permissions[0]);
    const user : User = await UserDB.removePermissionsUser(userID, permissions[1]);

    // TODO convert to { permissions { name => boolean, ..., ... }}
    response.status(200).send(user);
}));
