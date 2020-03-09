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
import {Course, CoursePartial} from "../../models/api/Course";
import {Comment} from "../../models/api/Comment";
import {CommentThread} from "../../models/api/CommentThread";
import {File} from "../../models/api/File";
import {Submission} from "../../models/api/Submission";
import {User} from "../../models/api/User";
import { instanceOfCommentThread, instanceOfFile, instanceOfSubmission, instanceOfUser, instanceOfCoursePartial } from '../InstanceOf';
import { issueToken } from '../../api/src/helpers/AuthenticationHelper';

/** Parameters for making requests to the API */
const BASE_URL = "http://localhost:5000";
const DEFAULT_ID = "AAAAAAAAAAAAAAAAAAAAAA";
const AUTHORIZATION_KEY = issueToken(DEFAULT_ID);

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
getFetch(`/api/course/`)
    .then((result: Course[]) => {

        assert(result.every(instanceOfCoursePartial), "/api/course/");
    })
    .catch((error: any) => console.log(error));

getFetch(`/api/course/${DEFAULT_ID}`)
    .then((result: Course) => {
        assert(instanceOfCoursePartial(result), "/api/course/ID");
    })
    .catch((error: any) => console.log(error));

/** ---------- Test Comment Thread ---------- */
getFetch(`/api/commentThread/${DEFAULT_ID}`)
    .then((result: CommentThread) => {
        assert(instanceOfCommentThread(result), "/api/commentThread/ID");
    })
    .catch((error: any) => console.log(error));

getFetch(`/api/commentThread/file/${DEFAULT_ID}`)
    .then((result: CommentThread[]) => {
        assert(result.every(instanceOfCommentThread), "/api/commentThread/file/ID");
    })
    .catch((error: any) => console.log(error));

getFetch(`/api/commentThread/submission/${DEFAULT_ID}`)
    .then((result: CommentThread[]) => {
        assert(result.every(instanceOfCommentThread), "/api/commentThread/submission/ID");
    })
    .catch((error: any) => console.log(error));

getFetch(`/api/commentThread/submission/${DEFAULT_ID}/recent`)
    .then((result : CommentThread[]) => {
        assert(result.every(instanceOfCommentThread), "/api/commentThread/submission/ID/recent")
    })
    .catch((error : any) => console.log(error));

/** ---------- Test File ---------- */
getFetch(`/api/file/${DEFAULT_ID}`)
    .then((result: File) => {
        assert(instanceOfFile(result), "/api/file/ID");
    })
    .catch((error: any) => console.log(error));

getFetch(`/api/file/submission/${DEFAULT_ID}`)
    .then((result: File[]) => {
        assert(result.every(instanceOfFile), "/api/file/ID");
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
        assert(result.every(instanceOfSubmission), "/api/submission/course/ID");
    })
    .catch((error: any) => console.log(error));

getFetch(`/api/submission/user/${DEFAULT_ID}`)
    .then((result: Submission[]) => {
        assert(result.every(instanceOfSubmission), "/api/submission/user/ID")
    })
    .catch((error: any) => console.log(error));

getFetch(`/api/submission/${DEFAULT_ID}`)
    .then((result: Submission) => {
        assert(instanceOfSubmission(result), "/api/submission/ID");
    })
    .catch((error: any) => console.log(error));

/** ---------- Test User ---------- */
getFetch(`/api/user/${DEFAULT_ID}`)
    .then((result: User) => {
        assert(instanceOfUser(result), "/api/user/ID");
    })
    .catch((error: any) => console.log(error));