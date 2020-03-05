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

import {CommentThread} from "../../models/api/CommentThread";
import {File} from "../../models/api/File";
import {Submission} from "../../models/api/Submission";
import {User} from "../../models/api/User";
import { instanceOfCommentThread, instanceOfFile, instanceOfSubmission, instanceOfUser } from '../InstanceOf';

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