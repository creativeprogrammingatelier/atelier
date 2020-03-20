/**
 * Api routes relating to comments
 */

import express, {Request, Response} from 'express';
import {capture} from "../helpers/ErrorHelper";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {AuthError, getCurrentUserID} from "../helpers/AuthenticationHelper";
import {Permission, CoursePermission} from "../../../models/api/Permission";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {getGlobalPermissions, requirePermission, requireRegistered} from "../helpers/PermissionHelper";
import {PermissionEnum} from "../../../models/enums/permissionEnum";
import {UserDB} from "../database/UserDB";
import {User} from "../../../models/api/User";
import {courseRole} from "../../../models/enums/courseRoleEnum";
import {getEnum} from "../../../models/enums/enumHelper";
import { CourseUser } from '../../../models/api/CourseUser';

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
 */
permissionRouter.get('/course/:courseID', capture(async(request :Request, response: Response) => {
    const courseID : string = request.params.courseID;
    const userID : string = await getCurrentUserID(request);

    // If user not registered in the course, return global permissions and localRole.none
    const courseUser : CourseUser = await CourseRegistrationDB.getSingleEntry(courseID, userID);
    const coursePermissions = courseUser.permission
    const permissions : number = coursePermissions.permissions;
    const permission : Permission = {
        globalRole : coursePermissions.globalRole,
        courseRole : coursePermissions.courseRole,
        permissions
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
        const permissionType : PermissionEnum = getEnum(PermissionEnum, permissions[i]); //PermissionEnum[permissions[i] as keyof typeof PermissionEnum];
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

    const CourseUser : CourseUser = await CourseRegistrationDB.removePermission({
        courseID,
        userID,
        permission : permissions[1]
    });

    response.status(200).send(CourseUser);
}));


/**
 * Add user permissions globally
 * - requirements:
 *  - manageUserPermissionsManager permission
 */
permissionRouter.put('/user/:userID/', capture(async(request : Request, response : Response) => {
    const currentUserID : string = await getCurrentUserID(request);

    // Requires manageUserPermissionsManage
    console.log(0)
    await requirePermission(currentUserID, PermissionEnum.manageUserPermissionsManager);
    console.log(1)
    const setPermissions = request.body.permissions;
    console.log(setPermissions);
    const userID : string = request.params.userID;
    const permissions = getPermissions(setPermissions);
    console.log(3, permissions);

    await UserDB.addPermissionsUser(userID, permissions[0]);
    console.log(4)
    const user : User = await UserDB.removePermissionsUser(userID, permissions[1]);
    console.log(5, user)
    response.status(200).send(user);
}));
