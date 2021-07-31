import {UUIDHelper} from "../../api/src/helpers/UUIDHelper";
import {DBTools, checkAvailable, toDec} from "../../api/src/database/HelperDB";
import {getEnum} from "../../helpers/EnumHelper";

import {CommentThread as APIThread} from "../api/CommentThread";
import {ThreadState} from "../enums/ThreadStateEnum";

import {fileToAPI, DBAPIFile, isNotNullFile} from "./File";
import {snippetToAPI, DBAPISnippet, isNotNullSnippet} from "./Snippet";
import { DBAPIUser } from "./User";
import { GlobalRole } from "../enums/GlobalRoleEnum";
import { CourseRole } from "../enums/CourseRoleEnum";

export interface Thread extends DBTools {
    commentThreadID?: string,
    submissionID?: string,
    courseID?: string,
    fileID?: string,
    snippetID?: string,
    submissionName?: string,
    submissionUserID?: string,
    submissionUserName?: string,
    visibilityState?: ThreadState,
    automated?: boolean,
    sharedByID?: string,
    sharedByName?: string,
    sharedByEmail?: string,
    sharedByGlobalRole?: string,
    sharedByCourseRole?: string,
    sharedByPermission?: string,
    //requires extra database call
    addComments?: boolean,
    automatedOnlyIfShared?: boolean
}
export interface DBThread {
    commentthreadid: string,
    submissionid: string,
    courseid: string,
    fileid: string,
    snippetid: string,
    submissionname: string,
    submissionuserid: string,
    submissionusername: string,
    visibilitystate: string,
    automated: boolean,
    sharedByID?: string,
    sharedByName?: string,
    sharedByEmail?: string,
    sharedByGlobalRole?: string,
    sharedByCourseRole?: string,
    sharedByPermission?: string,
    sharedBycanvasrefresh?: string
}

export {APIThread};
export type DBAPIThread = DBThread & DBAPIFile & DBAPISnippet

export function convertThread(db: DBThread): Thread {
    checkAvailable(["commentthreadid", "visibilitystate", "courseid", "submissionid", "fileid", "snippetid"], db);

    return {
        commentThreadID: UUIDHelper.fromUUID(db.commentthreadid),
        submissionID: UUIDHelper.fromUUID(db.submissionid),
        courseID: UUIDHelper.fromUUID(db.courseid),
        fileID: UUIDHelper.fromUUID(db.fileid),
        snippetID: UUIDHelper.fromUUID(db.snippetid),
        submissionName: db.submissionname,
        submissionUserID: UUIDHelper.fromUUID(db.submissionuserid),
        submissionUserName: db.submissionusername,
        visibilityState: getEnum(ThreadState, db.visibilitystate),
        automated: db.automated,
        sharedByID: UUIDHelper.fromUUID(db.sharedByID),
        sharedByName: db.sharedByName,
        sharedByEmail: db.sharedByEmail,
        sharedByGlobalRole: db.sharedByGlobalRole,
        sharedByCourseRole: db.sharedByCourseRole,
        sharedByPermission: db.sharedByPermission
    };
}
export function threadToAPI(db: DBAPIThread): APIThread {
    checkAvailable(["commentthreadid", "visibilitystate", "courseid", "submissionid"], db);
    const obj: APIThread = {
        ID: UUIDHelper.fromUUID(db.commentthreadid),
        file: fileToAPI(db),
        snippet: snippetToAPI(db),
        visibility: getEnum(ThreadState, db.visibilitystate),
        automated: db.automated,
        submission: {
            name: db.submissionname,
            user: {
                ID: UUIDHelper.fromUUID(db.submissionuserid),
                userName: db.submissionusername
            }
        },
        sharedBy: db.sharedByID === undefined ? undefined : {
            ID: UUIDHelper.fromUUID(db.sharedByID!),
            name: db.sharedByName!,
            email: db.sharedByEmail!,
            permission: {
                globalRole: getEnum(GlobalRole, db.sharedByGlobalRole!),
                courseRole: getEnum(CourseRole, db.sharedByCourseRole!),
                permissions: toDec(db.sharedByPermission!)
            },
            canvasrefresh : db.sharedBycanvasrefresh!
        },
        comments: [],
        references: {
            courseID: UUIDHelper.fromUUID(db.courseid),
            submissionID: UUIDHelper.fromUUID(db.submissionid)
        }
    };
    if (!isNotNullSnippet(obj.snippet!)) {
        delete obj.snippet;
        if (!isNotNullFile(obj.file!)) {
            delete obj.file;
        }
    }
    return obj;
}
