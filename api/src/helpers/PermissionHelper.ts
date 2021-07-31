import {CourseUser} from "../../../models/api/CourseUser";
import {User} from "../../../models/api/User";
import {CourseRole} from "../../../models/enums/CourseRoleEnum";
import {containsPermission, PermissionEnum} from "../../../models/enums/PermissionEnum";

import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {FileDB} from "../database/FileDB";
import {SubmissionDB} from "../database/SubmissionDB";
import {ThreadDB} from "../database/ThreadDB";
import {UserDB} from "../database/UserDB";

/** Error that gets thrown when the user is missing certain permissions. */
export class PermissionError extends Error {
    reason: string;

    constructor(reason: string, message: string) {
        super(message);
        this.reason = reason;
    }
}

/**
 * Check permissions of a user. Unions global and course permissions (if courseID provided), then checks
 * whether the user has all the required permissions set.
 * @param userID, ID of the user
 * @param requiredPermissions, required permissions. If any doesn't match, and error is thrown.
 * @param courseID, ID of the course if applicable
 * @param anyPermission, true if 1 or more of the permissions should be set
 */
export async function requirePermissions(userID: string, requiredPermissions: PermissionEnum[], courseID?: string, anyPermission = false) {

    let permissions = 0;
    if (courseID !== undefined) {
        const courseUser: CourseUser = await CourseRegistrationDB.getSingleEntry(courseID, userID);
        permissions = courseUser.permission.permissions;
    } else {
        permissions = (await UserDB.getUserByID(userID)).permission.permissions;
    }

    const access: boolean = anyPermission ?
        requiredPermissions.some((permission: PermissionEnum) => containsPermission(permission, permissions)) :
        requiredPermissions.every((permission: PermissionEnum) => containsPermission(permission, permissions));
    if (!access) {
        throw new PermissionError("permission.notAllowed", "You don't have the permissions to view/manage this data.");
    }
}

/**
 * Check permissions of a user. Unions global and course permissions (if courseID provided), then checks
 * whether the user has all the required permissions set.
 * @param userID, ID of the user
 * @param requiredPermission, permission that is required
 * @param courseID, ID of the course
 */
export async function requirePermission(userID: string, requiredPermission: PermissionEnum, courseID?: string) {
    await requirePermissions(userID, [requiredPermission], courseID);
}

/**
 * Check whether a user is registered in a course. Throws an error if this is not the case.
 * Exception if the user has a global permission to view all courses
 * @param userID, ID of the user
 * @param courseID, ID of the course
 */
export async function requireRegistered(userID: string, courseID: string) {
    // If user has permission to view all courses, there is not need to be registered
    const globalPermissions: number = await getGlobalPermissions(userID);
    if (containsPermission(PermissionEnum.viewAllCourses, globalPermissions)) {
        return;
    }

    // Check registration
    const courseUser: CourseUser = await CourseRegistrationDB.getSingleEntry(courseID, userID);
    if (courseUser.permission.courseRole === CourseRole.unregistered) {
        throw new PermissionError("permission.notRegistered", "You should be registered to the course to view/manage this data.");
    }
}

/**
 * Check whether a user is registered in a course. Uses the fileID to determine the course. Throws an error if this is not the case.
 * @param userID, ID of the user
 * @param fileID, ID of the file
 */
export async function requireRegisteredFileID(userID: string, fileID: string) {
    const courseID: string = (await FileDB.getFileByID(fileID)).references.courseID;
    await requireRegistered(userID, courseID);
}

/**
 * Check whether a user is registed in a course. Uses the commentThreaDID to determine the course. Throws an error if this is not the case.
 * @param userID, ID of the user
 * @param commentThreadID, ID of the commentThread
 */
export async function requireRegisteredCommentThreadID(userID: string, commentThreadID: string) {
    const courseID: string = (await ThreadDB.getThreadByID(commentThreadID)).references.courseID;
    await requireRegistered(userID, courseID);
}

export async function requireRegisteredSubmissionID(userID: string, submissionID: string) {
    const courseID: string = (await SubmissionDB.getSubmissionById(submissionID)).references.courseID;
    await requireRegistered(userID, courseID);
}

/**
 * Get global permissions of a user
 * @param userID, ID of the user
 */
export async function getGlobalPermissions(userID: string) {
    const user: User = await UserDB.getUserByID(userID);
    return user.permission.permissions;
}

/**
 * Get course permissions of a user. Global permissions are included.
 * @param userID, ID of the user
 * @param courseID, ID of the course
 */
export async function getCoursePermissions(userID: string, courseID: string) {
    const courseUser: CourseUser = await CourseRegistrationDB.getSingleEntry(courseID, userID);
    return courseUser.permission.permissions;
}

/**
 * Get global role of a user
 * @param userID, ID of the user
 */
export async function getGlobalRole(userID: string) {
    const user: User = await UserDB.getUserByID(userID);
    return user.permission.globalRole;
}

/**
 * Get current role in a course of a user
 * @param userID, ID of the user
 * @param courseID, ID of the course
 */
export async function getCurrentRole(userID: string, courseID: string) {
    const courseUser: CourseUser = await CourseRegistrationDB.getSingleEntry(courseID, userID);
    return courseUser.permission.courseRole;
}

/**
 * Take a list of permissions and returns the resulting permission number.
 * Possible future use:
 *  - In database use this instead of hardcoded permission number to make it more
 *    clear what permissions certain roles have.
 */
export function getPermissionNumber(permissions: PermissionEnum[]) {
    let result = 0;
    permissions.forEach(permission => result += 2 ** permission);
    return result;
}
