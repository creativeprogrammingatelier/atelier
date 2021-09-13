import {UUIDHelper} from "../../api/src/helpers/UUIDHelper";
import {DBTools, checkAvailable, toDec} from "../../api/src/database/HelperDB";

import {getEnum} from "../../helpers/EnumHelper";

import {Course as APICourse, CoursePartial as APICoursePartial} from "../api/Course";
import {Permission} from "../api/Permission";
import {GlobalRole} from "../enums/GlobalRoleEnum";
import {CourseRole} from "../enums/CourseRoleEnum";
import {CourseState} from "../enums/CourseStateEnum";

import {userToAPI, DBUser} from "./User";

export interface Course extends DBTools {
    courseID?: string,
    courseName?: string,
    creatorID?: string,
    state?: CourseState,
    canvasCourseID?: string,
}
export interface DBCourse {
    courseid: string,
    coursename: string,
    creatorid: string,
    state: string,
    canvascourseid: string
}

export {APICourse};
export type DBAPICourse = DBCourse & DBUser
export interface DBCourseExt extends DBAPICourse {
    currentglobalrole: string,
    currentcourserole: string,
    currentpermission: string
}

export function convertCourse(db: DBCourse): Course {
    checkAvailable(["courseid", "coursename", "creatorid", "state"], db);
    return {
        courseID: UUIDHelper.fromUUID(db.courseid),
        courseName: db.coursename,
        creatorID: UUIDHelper.fromUUID(db.creatorid),
        state: getEnum(CourseState, db.state)
    };
}
export function courseToAPIPartial(db: DBAPICourse): APICoursePartial {
    checkAvailable(["courseid", "coursename", "state", "creator"], db);
    return {
        ID: UUIDHelper.fromUUID(db.courseid),
        name: db.coursename,
        state: getEnum(CourseState, db.state),
        creator: userToAPI(db)
    };
}
export function courseToAPI(db: DBCourseExt): APICourse {
    checkAvailable(["courseid", "coursename", "state", "creator"], db);
    return {
        ...courseToAPIPartial(db),
        currentUserPermission: {
            globalRole: getEnum(GlobalRole, db.currentglobalrole),
            courseRole: getEnum(CourseRole, db.currentcourserole),
            permissions: toDec(db.currentpermission)
        }
    };
}
export function coursePartialToAPI(partial: APICoursePartial, permission: Permission): APICourse {
    return {...partial, currentUserPermission: permission};
}
