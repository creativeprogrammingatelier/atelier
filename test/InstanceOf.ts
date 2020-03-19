import { Course, CoursePartial } from "../models/api/Course";
import { Comment } from "../models/api/Comment";
import { CommentThread } from "../models/api/CommentThread";
import { File } from "../models/api/File";
import { Permission } from "../models/api/Permission";
import { Snippet } from "../models/api/Snippet";
import { Submission } from "../models/api/Submission";
import { User } from "../models/api/User";
import {APIError} from "../models/api/Error";
import {CourseRegistrationOutput} from "../models/database/CourseRegistration";
import {CourseUser} from "../models/database/CourseUser";

/**
 * Interface type checking, because this is not built in...
 * Constructor takes any, as it should be able to check any object to match the interface.
 */

// tslint:disable-next-line:no-any
export function instanceOfCourse(object: any): object is Course {
    return ('ID' in object
        && typeof object.ID === 'string'
        && 'name' in object
        && typeof object.name === 'string'
        && 'state' in object
        && typeof object.state === 'string'
        && 'creator' in object
        && instanceOfUser(object.creator)
        && 'currentUserPermission' in object
        && instanceOfPermission(object.currentUserPermission));
}

// tslint:disable-next-line:no-any
export function instanceOfCourseUser(object : any): object is CourseUser {
    return ('userID' in object
        && typeof object.userID === 'string'
        && 'courseID' in object
        && typeof object.courseID === 'string'
        && 'userName' in object
        && typeof object.userName === 'string'
        && 'email' in object
        && typeof object.email === 'string'
        && 'globalRole' in object
        && typeof object.globalRole === 'string'
        && 'courseRole' in object
        && typeof object.courseRole === 'string'
        && 'permission' in object
        //&& object.permission === 'number'
    )
}

// tslint:disable-next-line:no-any
export function instanceOfComment(object: any): object is Comment {
    return ('ID' in object
        && typeof object.ID === 'string'
        && 'user' in object
        && instanceOfUser(object.user)
        && 'text' in object
        && typeof object.text === 'string'
        && 'date' in object
        && typeof object.date === 'string'
        && 'references' in object
        && typeof object.references === 'object');
}

// tslint:disable-next-line:no-any
export function instanceOfCommentThread(object: any): object is CommentThread {
    return ('ID' in object
        && typeof object.ID === 'string'
        && 'visibility' in object
        && typeof object.visibility === 'string'
        && 'comments' in object
        && object.comments.every(instanceOfComment)
        && (object.file === undefined || instanceOfFile(object.file))
        && (object.snippet === undefined || instanceOfSnippet(object.snippet))
        && 'references' in object);
}

// tslint:disable-next-line:no-any
export function instanceOfFile(object: any): object is File {
    return ('ID' in object
        && typeof object.ID === 'string'
        && 'name' in object
        && typeof object.name === 'string'
        && 'type' in object
        && typeof object.type === 'string'
        && 'references' in object);
}

// tslint:disable-next-line:no-any
export function instanceOfPermission(object: any): object is Permission {
    return ('role' in object
        && typeof object.role === 'string'
        && 'permissions' in object
        && typeof object.permissions === 'number');
}

// TODO additional type checking depending on what search will contain
// tslint:disable-next-line:no-any
export function instanceOfSearch(object: any) {
    return ('comments' in object
        && 'users' in object);
}

// tslint:disable-next-line:no-any
export function instanceOfSnippet(object: any): object is Snippet {
    return ('ID' in object
        && typeof object.ID === 'string'
        && 'file' in object
        && instanceOfFile(object.file)
        && 'start' in object
        && typeof object.start === 'object'
        && 'line' in object.start
        && typeof object.start.line === 'number'
        && 'character' in object.start
        && typeof object.start.character === 'number'
        && 'end' in object
        && typeof object.end === 'object'
        && 'line' in object.end
        && typeof object.end.line === 'number'
        && 'character' in object.end
        && typeof object.end.character === 'number'
        && 'references' in object);
}

// tslint:disable-next-line:no-any
export function instanceOfSubmission(object: any): object is Submission {
    return ('ID' in object
        && typeof object.ID === 'string'
        && 'name' in object
        && typeof object.name === 'string'
        && 'user' in object
        && instanceOfUser(object.user)
        && 'date' in object
        && typeof object.date === 'string'
        && 'state' in object
        && typeof object.state === 'string'
        && 'files' in object
        && object.files.every(instanceOfFile)
        && 'references' in object);
}

// tslint:disable-next-line:no-any
export function instanceOfUser(object: any): object is User {
    return ('ID' in object
        && typeof object.ID === 'string'
        && 'name' in object
        && typeof object.ID === 'string'
        && 'email' in object
        && typeof object.ID === 'string'
        && 'permission' in object
        && instanceOfPermission(object.permission));
}

// tslint:disable-next-line:no-any
export function instanceOfCoursePartial(object: any) : object is CoursePartial {
    return ('ID' in object
        && typeof object.ID === 'string'
        && 'name' in object
        && typeof object.name === 'string'
        && 'state' in object
        && typeof object.state === 'string'
        && 'creator' in object
        && instanceOfUser(object.creator)
    )
}

// tslint:disable-next-line:no-any
export function instanceOfCourseRegistration(object : any) : object is CourseRegistrationOutput {
    return ('courseID' in object
        && typeof object.courseID === 'string'
        && 'userID' in object
        && typeof object.userID === 'string'
        && 'role' in object
        && typeof object.role === 'string'
        && 'permission' in object
        && typeof object.permission === 'number'
    )
}