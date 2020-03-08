/**
 * Middleware function that requires user to have a specified role in a course for a certain request.
 */
import {CourseRegistrationOutput} from "../../../models/database/CourseRegistration";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {AuthError} from "./AuthenticationHelper";
import {User} from "../../../models/api/User";
import {UserDB} from "../database/UserDB";

interface checkRoles {
    userID : string,
    globalRoles? : string[],
    currentRoles? : string[],
    courseID? : string,
    users? : string[]
}

/**
 * Throws an exception if not authorized. Check if either user has any of the global roles, currentRoles or belongs
 * to the user list of exceptions.
 * @param userID, ID of the requesting user
 * @param globalRoles, global roles that are allowed to make the request
 * @param currentRoles, current roles (in course) that are allowed to make the request
 * @param courseID, ID of the course if relevant for the current role
 * @param users, list of user IDs that are allowed to make the request
 */
export async function requireRole({userID, globalRoles, currentRoles, courseID, users} : checkRoles) {
    if (globalRoles !== undefined) {
        const globalRole : string = await getGlobalRole(userID);
        if (globalRoles.includes(globalRole)) return true;
    }
    if (currentRoles !== undefined && courseID !== undefined)  {
        const currentRole : string | undefined = await getCurrentRole(userID, courseID);
        if (currentRole !== undefined && currentRoles.includes(currentRole)) return true;
    }
    if (users !== undefined && users.includes(userID)) {
        return true;
    }
    throw new AuthError("role.notAllowed", "You're not qualified to access this information");
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