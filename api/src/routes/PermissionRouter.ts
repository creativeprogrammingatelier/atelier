import express, {Request, Response} from "express";

import {CourseUser} from "../../../models/api/CourseUser";
import {Permission, Permissions} from "../../../models/api/Permission";
import {User} from "../../../models/api/User";
import {containsPermission, managePermissionBits, PermissionEnum, viewPermissionBits} from "../../../models/enums/PermissionEnum";

import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {getEnum} from "../../../helpers/EnumHelper";
import {capture} from "../helpers/ErrorHelper";

import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {UserDB} from "../database/UserDB";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {RequestB} from "../helpers/RequestHelper";

/**
 * Api routes relating to comments
 */

export const permissionRouter = express.Router();
permissionRouter.use(AuthMiddleware.requireAuth);

async function getPermissions(setPermissions: Permissions, currentUserID: string) {
    // Get permission bits the user is allowed to set.
    const user: User = await UserDB.getUserByID(currentUserID);
    const userPermissions = user.permission.permissions;
    const permissionsToSet =
        (containsPermission(PermissionEnum.manageUserPermissionsView, userPermissions)
            ? BigInt(viewPermissionBits)
            : BigInt(0))
        | (containsPermission(PermissionEnum.manageUserPermissionsManager, userPermissions)
            ? BigInt(managePermissionBits)
            : BigInt(0));

    let addPermissions = BigInt(0);
    let removePermissions = BigInt(0);

    const permissions = Object.keys(setPermissions);
    const add: (boolean | undefined)[] = Object.values(setPermissions);

    for (let i = 0; i < permissions.length; i++) {
        const permissionType: PermissionEnum = getEnum(PermissionEnum, permissions[i]);
        if (add[i]) {
            addPermissions |= (BigInt(1) << BigInt(permissionType));
        } else {
            removePermissions |= (BigInt(1) << BigInt(permissionType));
        }
    }

    // Convert permissions back to number after bit operations
    return [
        (addPermissions & permissionsToSet).toString() as unknown as number,
        (removePermissions & permissionsToSet).toString() as unknown as number
    ];
}

// ---------- GET REQUESTS ----------

/**
 * Get global permissions of user
 */
permissionRouter.get("/", capture(async(request: Request, response: Response) => {
    const currentUserID: string = await getCurrentUserID(request);
    const user: User = await UserDB.getUserByID(currentUserID);
    response.status(200).send(user.permission);
}));

/**
 * Get user permissions of a course
 */
permissionRouter.get("/course/:courseID", capture(async(request: Request, response: Response) => {
    const courseID: string = request.params.courseID;
    const userID: string = await getCurrentUserID(request);

    // If user not registered in the course, return global permissions and localRole.unregistered
    const courseUser: CourseUser = await CourseRegistrationDB.getSingleEntry(courseID, userID);
    const coursePermissions = courseUser.permission;
    const permissions: number = coursePermissions.permissions;
    const permission: Permission = {
        globalRole: coursePermissions.globalRole,
        courseRole: coursePermissions.courseRole,
        permissions
    };
    response.status(200).send(permission);
}));

// ---------- PUT REQUESTS ----------

interface PermissionsBody {
    permissions: Permissions
}

/**
 * Add user permissions in a course
 * - requirements:
 *  - manageUserPermissionsManager permission
 */
permissionRouter.put("/course/:courseID/user/:userID/", capture(async(request: RequestB<PermissionsBody>, response) => {
    const currentUserID: string = await getCurrentUserID(request);
    const courseID: string = request.params.courseID;

    const setPermissions = request.body.permissions;
    const userID: string = request.params.userID;
    const permissions = await getPermissions(setPermissions, currentUserID);

    await CourseRegistrationDB.addPermission({
        courseID,
        userID,
        permission: permissions[0]
    });

    const courseUser: CourseUser = await CourseRegistrationDB.removePermission({
        courseID,
        userID,
        permission: permissions[1]
    });

    response.status(200).send(courseUser);
}));

/**
 * Add user permissions globally
 * - requirements:
 *  - manageUserPermissionsManager or manageUserPermissionsView depending on the permission
 */
permissionRouter.put("/user/:userID/", capture(async(request: RequestB<PermissionsBody>, response) => {
    const currentUserID: string = await getCurrentUserID(request);

    const setPermissions = request.body.permissions;
    const userID: string = request.params.userID;
    const permissions = await getPermissions(setPermissions, currentUserID);

    await UserDB.addPermissionsUser(userID, permissions[0]);
    const user: User = await UserDB.removePermissionsUser(userID, permissions[1]);
    response.status(200).send(user);
}));

/**
 * USEFUL DEBUGGING PATH
 * Get all permissions.
 */
// permissionRouter.get('/all', capture(async(request: Request, response: Response) => {
//     const allPermissions = await CourseRegistrationDB.getAllEntries();
//     response.status(200).send(allPermissions);
// }));
