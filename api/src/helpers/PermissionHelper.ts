/**
 * Middleware function that requires user to have a specified role in a course for a certain request.
 */
import {CourseRegistrationOutput} from "../../../models/database/CourseRegistration";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {AuthError} from "./AuthenticationHelper";
import {User} from "../../../models/api/User";
import {UserDB} from "../database/UserDB";
import {containsPermission, PermissionEnum} from "../../../enums/permissionEnum";
import {FileDB} from "../database/FileDB";
import {ThreadDB} from "../database/ThreadDB";
import {SubmissionDB} from "../database/SubmissionDB";

/**
 * Check permissions of a user. Unions global and course permissions (if courseID provided), then checks
 * whether the user has all the required permissions set.
 * @param userID, ID of the user
 * @param requiredPermissions, required permissions. If any doesn't match, and error is thrown.
 * @param courseID, ID of the course if applicable
 */
export async function requirePermissions(userID : string, requiredPermissions : PermissionEnum[], courseID? : string) {
    const globalPermissions : number = (await UserDB.getUserByID(userID)).permission.permissions;
    let coursePermissions : number = 0;
    if (courseID !== undefined) {
        const courseRegistrationOutput : CourseRegistrationOutput[] = await CourseRegistrationDB.getSubset([courseID], [userID]);
        if (courseRegistrationOutput.length > 0) {
            coursePermissions = courseRegistrationOutput[0].permission;
        }
    }
    console.log("global permissions: " + globalPermissions);
    console.log("course permissions: " + coursePermissions);
    const permissions : number = globalPermissions | coursePermissions;

    const access : boolean = requiredPermissions.every((permission : PermissionEnum) => containsPermission(permission, permissions));
    if (!access) throw new AuthError("permission.notAllowed", "You don't have the permissions to view/manage this data.");
}

/**
 * Check permissions of a user. Unions global and course permissions (if courseID provided), then checks
 * whether the user has all the required permissions set.
 * @param userID, ID of the user
 * @param requiredPermission, permission that is required
 * @param courseID, ID of the course
 */
export async function requirePermission(userID : string, requiredPermission : PermissionEnum, courseID? : string) {
    await requirePermissions(userID, [requiredPermission], courseID);
}

/**
 * Check whether a user is registered in a course. Throws an error if this is not the case.
 * Exception if the user has a global permission to view all courses
 * @param userID, ID of the user
 * @param courseID, ID of the course
 */
export async function requireRegistered(userID : string, courseID : string) {
    // If user has permission to view all courses, there is not need to be registered
    const globalPermissions : number = await getGlobalPermissions(userID);
    if (containsPermission(PermissionEnum.viewAllCourses, globalPermissions)) return;

    // Check registration
    const courseRegistrationOutput : CourseRegistrationOutput[] = await CourseRegistrationDB.getSubset([courseID], [userID]);
    if (courseRegistrationOutput.length == 0) throw new AuthError("permission.notRegistered", "You should be registered to the course to view/manage this data.");
}

/**
 * Check whether a user is registered in a course. Uses the fileID to determine the course. Throws an error if this is not the case.
 * @param userID, ID of the user
 * @param fileID, ID of the file
 */
export async function requireRegisteredFileID(userID : string, fileID : string) {
    const courseID : string = (await FileDB.getFileByID(fileID)).references.courseID;
    await requireRegistered(userID, courseID);
}

/**
 * Check whether a user is registed in a course. Uses the commentThreaDID to determine the course. Throws an error if this is not the case.
 * @param userID, ID of the user
 * @param commentThreadID, ID of the commentThread
 */
export async function requireRegisteredCommentThreadID(userID : string, commentThreadID : string) {
    const courseID : string = (await ThreadDB.getThreadByID(commentThreadID)).references.courseID;
    await requireRegistered(userID, courseID);
}

export async function requireRegisteredSubmissionID(userID : string, submissionID : string) {
    const courseID : string = (await SubmissionDB.getSubmissionById(submissionID)).references.courseID;
    await requireRegistered(userID, courseID);
}

/**
 * Get global permissions of a user
 * @param userID, ID of the user
 */
export async function getGlobalPermissions(userID : string) {
    const user : User = await UserDB.getUserByID(userID);
    return user.permission.permissions;
}

/**
 * Get course permissions of a user. Global permissions are included.
 * @param userID, ID of the user
 * @param courseID, ID of the course
 */
export async function getCoursePermissions(userID : string, courseID : string) {
    const globalPermissions : number = await getGlobalPermissions(userID);
    const courseRegistrationOutput : CourseRegistrationOutput[] = await CourseRegistrationDB.getSubset([courseID], [userID]);
    const coursePermissions = (courseRegistrationOutput.length === 0) ? 0 : courseRegistrationOutput[0].permission;
    return globalPermissions | coursePermissions;
}

/**
 * Get global role of a user
 * @param userID, ID of the user
 */
export async function getGlobalRole(userID : string) {
    const user : User = await UserDB.getUserByID(userID);
    return user.permission.role;
}

/**
 * Get current role in a course of a user
 * @param userID, ID of the user
 * @param courseID, ID of the course
 */
export async function getCurrentRole(userID : string, courseID: string) {
    const courseRegistrationOutput : CourseRegistrationOutput[] = await CourseRegistrationDB.getSubset([courseID], [userID]);
    if (courseRegistrationOutput.length == 0) return undefined;
    return courseRegistrationOutput[0].role;
}