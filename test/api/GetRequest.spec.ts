/** Tests API paths
 *
 * - Checks whether the response matches the interface type
 * - Checks whether the types match the interface types in case of User / Permission / File
 *
 * Notes:
 * - Default ID's should exist for certain database types such as files in order not to give a 404
 * - Tests are run in the backend, where local storage does not exist, so authorization key needs
 *   to be provided by the user.
 * */

import {assert} from 'chai';

/** Interfaces the API should match */
import {Course} from "../../models/api/Course";
import {Comment} from "../../models/api/Comment";
import {CommentThread} from "../../models/api/CommentThread";
import {File} from "../../models/api/File";
import {Permission} from "../../models/api/Permission";
import {Snippet} from "../../models/api/Snippet";
import {Submission} from "../../models/api/Submission";
import {User} from "../../models/api/User";

/** Parameters for making requests to the API */
const BASE_URL = "http://localhost:5000";
const DEFAULT_ID = "AAAAAAAAAAAAAAAAAAAAAA";
const AUTHORIZATION_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFAYS5hIiwiaWF0IjoxNTgyMDI5NDkyLCJleHAiOjE1ODcwNjk0OTJ9.ZiN4uRJZqLVxZ3N_UVjnIvIhgoYhM_1j3eLNqPiHMBQ";

/** Fetch methods */
const fetch = require('node-fetch');

function getFetch(extension: string, data: any = {}) {
    return fetch(BASE_URL + extension, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': AUTHORIZATION_KEY,
            ...data
        }
    }).then((result: any) => result.json());
}

/** Interface type checking, because this is not built in... */
function instanceOfCourse(object: any): object is Course {
    return (
        'ID' in object
        && 'name' in object
        && 'state' in object
        && 'creator' in object
        && instanceOfUser(object.creator)
        && 'currentUserPermission' in object
    )
}

function instanceOfComment(object: any): object is Comment {
    return (
        'ID' in object
        && 'user' in object
        && instanceOfUser(object.user)
        && 'text' in object
        && 'date' in object
        && 'references' in object
    )
}

function instanceOfCommentThread(object: any): object is CommentThread {
    return (
        'ID' in object
        && 'submissionID' in object
        && 'visibility' in object
        && 'comments' in object
        && object.comments.every(instanceOfComment)
        && (object.file == undefined || instanceOfFile(object.file))
        && (object.snippet == undefined || instanceOfSnippet(object.snippet))
        && 'references' in object
    )
}

function instanceOfFile(object: any): object is File {
    return (
        'ID' in object
        && 'name' in object
        && 'type' in object
        && 'references' in object
    )
}

function instanceOfPermission(object: any): object is Permission {
    return (
        'role' in object
        && 'permission' in object
    )
}

// TODO additional type checking depending on what search will contain
function instanceOfSearch(object : any) {
    return (
        'comments' in object
        && 'users' in object
    )
}

function instanceOfSnippet(object: any): object is Snippet {
    return (
        'ID' in object
        && 'file' in object
        && instanceOfFile(object.file)
        && 'start' in object
        && 'line' in object.start
        && 'character' in object.start
        && 'end' in object
        && 'line' in object.end
        && 'character' in object.end
        && 'references' in object
    )
}

function instanceOfSubmission(object: any): object is Submission {
    return (
        'ID' in object
        && 'name' in object
        && 'user' in object
        && instanceOfUser(object.user)
        && 'date' in object
        && 'state' in object
        && 'files' in object
        && object.files.every(instanceOfFile)
        && 'references' in object
    )
}

function instanceOfUser(object: any): object is User {
    return (
        'ID' in object
        && 'name' in object
        && 'email' in object
        && 'permission' in object
        && instanceOfPermission(object.permission)
    )
}

/** ---------- Test Course ---------- */
// getFetch(`/api/course/`)
//     .then((result: Course[]) => {
//         assert(result.every(instanceOfCourse));
//     })
//     .catch((error: any) => console.log(error));
//
// getFetch(`/api/course/${DEFAULT_ID}`)
//     .then((result: Course) => {
//         assert(instanceOfCourse(result), 'getCourse returns a course object');
//     })
//     .catch((error: any) => console.log(error));

/** ---------- Test Comment Thread ---------- */
getFetch(`/api/commentThread/${DEFAULT_ID}`)
    .then((result: CommentThread) => {
        assert(instanceOfCommentThread(result));
    })
    .catch((error: any) => console.log(error));

getFetch(`/api/commentThread/file/${DEFAULT_ID}`)
    .then((result: CommentThread[]) => {
        assert(result.every(instanceOfCommentThread));
    })
    .catch((error: any) => console.log(error));

getFetch(`/api/commentThread/submission/${DEFAULT_ID}`)
    .then((result: CommentThread[]) => {
        assert(result.every(instanceOfCommentThread));
    })
    .catch((error: any) => console.log(error));

getFetch(`/api/commentThread/submission/${DEFAULT_ID}/recent`)
    .then((result : CommentThread[]) => {
        assert(result.every(instanceOfCommentThread))
    })
    .catch((error : any) => console.log(error));

/** ---------- Test File ---------- */
getFetch(`/api/file/${DEFAULT_ID}`)
    .then((result: File) => {
        assert(instanceOfFile(result));
    })
    .catch((error: any) => console.log(error));

getFetch(`/api/file/submission/${DEFAULT_ID}`)
    .then((result: File[]) => {
        assert(result.every(instanceOfFile));
    })
    .catch((error: any) => console.log(error));

/** ---------- Test Search ---------- */
// getFetch(`/api/search/a`)
//     .then((result : any) => {
//         assert(instanceOfSearch(result));
//     })
//     .catch((error : any) => console.log(error));

/** ---------- Test Submission ---------- */
getFetch(`/api/submission/course/${DEFAULT_ID}`)
    .then((result: Submission[]) => {
        assert(result.every(instanceOfSubmission));
    })
    .catch((error: any) => console.log(error));

getFetch(`/api/submission/user/${DEFAULT_ID}`)
    .then((result: Submission[]) => {
        assert(result.every(instanceOfSubmission))
    })
    .catch((error: any) => console.log(error));

getFetch(`/api/submission/${DEFAULT_ID}`)
    .then((result: Submission) => {
        assert(instanceOfSubmission(result));
    })
    .catch((error: any) => console.log(error));

/** ---------- Test User ---------- */
getFetch(`/api/user/${DEFAULT_ID}`)
    .then((result: User) => {
        assert(instanceOfUser(result));
    })
    .catch((error: any) => console.log(error));