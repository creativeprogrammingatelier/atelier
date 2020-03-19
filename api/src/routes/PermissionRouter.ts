/**
 * Api routes relating to comments
 */

import express, {Request, Response} from 'express';
import {capture} from "../helpers/ErrorHelper";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {CourseRegistrationOutput} from "../../../models/database/CourseRegistration";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {Permission, Permissions} from "../../../models/api/Permission";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {getGlobalPermissions, requirePermission} from "../helpers/PermissionHelper";
import {
    containsPermission,
    managePermissionBits,
    PermissionEnum,
    viewPermissionBits
} from "../../../models/enums/permissionEnum";
import {UserDB} from "../database/UserDB";
import {User} from "../../../models/api/User";
import {courseRole} from "../../../models/enums/courseRoleEnum";
import {getEnum} from "../../../models/enums/enumHelper";

export const permissionRouter = express.Router();
permissionRouter.use(AuthMiddleware.requireAuth);

/** ---------- GET REQUESTS ---------- */

/**
 * Get global permissions of user
 */
permissionRouter.get('/', capture(async(request : Request, response : Response) => {
    const currentUserID : string = await getCurrentUserID(request);
    const user : User = await UserDB.getUserByID(currentUserID);
    response.status(200).send(user.permission);
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
    const coursePermissions : CourseRegistrationOutput[] = await CourseRegistrationDB.getSubset([courseID], [userID]);
    const coursePermission : number = coursePermissions.length > 0 ? coursePermissions[0].permission : 0;
    const globalPermission : number = await getGlobalPermissions(userID);

    const permission : Permission = {
        role : coursePermissions.length > 0 ? coursePermissions[0].role : courseRole.unregistered,
        permissions : coursePermission | globalPermission
    };
    response.status(200).send(permission);
}));

/** ---------- PUT REQUESTS ---------- */
async function getPermissions(setPermissions : Permissions, currentUserID : string) {
    // Get permission bits the user is allowed to set.
    const user : User = await UserDB.getUserByID(currentUserID);
    const userPermissions = user.permission.permissions;
    const permissionsToSet =
        (containsPermission(PermissionEnum.manageUserPermissionsView, userPermissions) ? BigInt(viewPermissionBits) : BigInt(0)) |
        (containsPermission(PermissionEnum.manageUserPermissionsManager, userPermissions) ? BigInt(managePermissionBits) : BigInt(0));

    let addPermissions = BigInt(0);
    let removePermissions = BigInt(0);

    const permissions = Object.keys(setPermissions);
    const add : boolean[] = Object.values(setPermissions);

    for (let i = 0; i < permissions.length; i++) {
        const permissionType : PermissionEnum = getEnum(PermissionEnum, permissions[i]);
        if (add[i]) addPermissions |= (BigInt(1) << BigInt(permissionType));
        else removePermissions |= (BigInt(1) << BigInt(permissionType));
    }

    // Convert permissions back to number after bit operations
    return [
        (addPermissions & permissionsToSet).toString() as unknown as number,
        (removePermissions & permissionsToSet).toString() as unknown as number
    ];
}

/**
 * Add user permissions in a course
 * - requirements:
 *  - manageUserPermissionsManager permission
 */
permissionRouter.put('/course/:courseID/user/:userID/', capture(async(request : Request, response : Response) => {
    const currentUserID : string = await getCurrentUserID(request);
    const courseID : string = request.params.courseID;

    const setPermissions = request.body.permissions;
    const userID : string = request.params.userID;
    const permissions = await getPermissions(setPermissions, currentUserID);

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

    response.status(200).send(courseRegistrationOutput);
}));


/**
 * Add user permissions globally
 * - requirements:
 *  - manageUserPermissionsManager permission
 */
permissionRouter.put('/user/:userID/', capture(async(request : Request, response : Response) => {
    const currentUserID : string = await getCurrentUserID(request);

    const setPermissions = request.body.permissions;
    console.log(setPermissions);
    const userID : string = request.params.userID;
    const permissions = await getPermissions(setPermissions, currentUserID);

    await UserDB.addPermissionsUser(userID, permissions[0]);
    const user : User = await UserDB.removePermissionsUser(userID, permissions[1]);

    response.status(200).send(user);
}));
