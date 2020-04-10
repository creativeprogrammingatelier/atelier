import {Request, Response} from 'express';
import {getCurrentUserID} from '../helpers/AuthenticationHelper';
import {UserDB} from '../database/UserDB';
import {CourseRole} from '../../../models/enums/CourseRoleEnum';
import {GlobalRole} from '../../../models/enums/GlobalRoleEnum';

/**
 * @TODO this does in not the required behaviour
 */
export default class PermissionsMiddleware {
    static async isTa(request: Request, result: Response, onSuccess: Function) {
        const userID = await getCurrentUserID(request);
        const user = await UserDB.getUserByID(userID);
        const teacherString = CourseRole.teacher;
        if (user.permission.courseRole?.toLowerCase() === teacherString) {
            onSuccess();
        } else {
            result.status(401).send();
        }
    }

    static async isAdmin(request: Request, result: Response, onSuccess: Function) {
        const userID = await getCurrentUserID(request);
        const user = await UserDB.getUserByID(userID);
        const adminString = GlobalRole.admin;
        if (user.permission.globalRole.toLowerCase() === adminString) {
            onSuccess();
        } else {
            result.status(401).send();
        }
    }
}
