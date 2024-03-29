import {DBTools, checkAvailable, toDec} from "../../api/src/database/HelperDB";

import {getEnum} from "../../helpers/EnumHelper";

import {CoursePermission as APICoursePermission} from "../api/Permission";
import {CourseRole} from "../enums/CourseRoleEnum";

export interface DBRolePermission extends DBTools {
    courseroleid: string,
    permission: string
}

export {APICoursePermission};
export type DBAPIRolePermission = DBRolePermission
export type CoursePermission = Partial<APICoursePermission>

export function convertRolePermission(db: DBRolePermission): CoursePermission {
    checkAvailable(["courseroleid", "permission"], db);
    return {
        courseRole: getEnum(CourseRole, db.courseroleid),
        permissions: toDec(db.permission)
    };
}
export function rolePermToAPI(db: DBAPIRolePermission): CoursePermission {
    return convertRolePermission(db);
}
