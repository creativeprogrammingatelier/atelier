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


// /**
//  * Require a certain current role (role within a course)
//  * @param roles, allowed roles
//  * @param userID, ID of the user
//  * @param courseID, ID of the course
//  */
// export async function requireCurrentRole(roles : string[], userID : string, courseID : string) {
//     const courseRegistrationOutput : CourseRegistrationOutput[] = await CourseRegistrationDB.getSubset([courseID], [userID]);
//     if (courseRegistrationOutput[0] == undefined) throw new AuthError("role.noRegistration", "You're not qualified to access this information.");
//     if (!roles.includes(courseRegistrationOutput[0].role)) throw new AuthError("role.notAllowed", "You're not qualified to access this information.");
//     return true;
// }
//
// /**
//  * Require a certain global role (account role)
//  * @param roles. allowed roles
//  * @param userID, ID of the user
//  */
// export async function requireGlobalRole(roles: string[], userID : string) {
//     const user : User = await UserDB.getUserByID(userID);
//     if (!roles.includes(user.permission.role)) throw new AuthError("role.notAllowed", "You're not qualified to access this information");
//     return true;
// }

export async function getGlobalRole(userID : string) {
    const user : User = await UserDB.getUserByID(userID);
    return user.permission.role;
}

export async function getCurrentRole(userID : string, courseID: string) {
    const courseRegistrationOutput : CourseRegistrationOutput[] = await CourseRegistrationDB.getSubset([courseID], [userID]);
    if (courseRegistrationOutput.length == 0) return undefined;
    return courseRegistrationOutput[0].role;
}