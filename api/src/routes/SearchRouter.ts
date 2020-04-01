/** 
 * Routes for searching.
 * All routes accept these query parameters:
 * - q: the search query
 * - limit: the maximum number of results
 * - offset: the number of results to skip, used for paging
 * - courseID: limit the returned items to be part of this course
 * - userID: limit the returned items to be created by this user
 */

import express, { Request } from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { UserDB } from '../database/UserDB';
import { CommentDB } from '../database/CommentDB';
import { capture } from "../helpers/ErrorHelper";
import { User } from "../../../models/database/User";
import { SnippetDB } from '../database/SnippetDB';
import { SearchResult } from '../../../models/api/SearchResult';
import { getCommonQueryParams, InvalidParamsError } from '../helpers/ParamsHelper';
import { CourseRegistrationDB } from '../database/CourseRegistrationDB';
import { CourseDB } from '../database/CourseDB';
import { CourseUserToUser } from '../../../models/database/CourseUser';
import { getCurrentUserID, AuthError } from '../helpers/AuthenticationHelper';
import { SubmissionDB } from '../database/SubmissionDB';
import { FileDB } from '../database/FileDB';
import { map } from '../database/HelperDB';
import {PermissionError, requirePermissions, requireRegistered} from '../helpers/PermissionHelper';
import { PermissionEnum } from '../../../models/enums/PermissionEnum';
import { Sorting } from '../../../models/enums/SortingEnum';

export const searchRouter = express.Router();

// Authentication is required for all endpoints
searchRouter.use(AuthMiddleware.requireAuth);

interface Common {
    courseID: string | undefined;
    userID: string | undefined;
    submissionID: string | undefined;
    currentUserID: string;
    limit?: number;
    offset?: number;
    sorting?: Sorting;
}
/** Get the parameters for a search query, throws an error if invalid */
async function getSearchParams(request: Request) : Promise<{query:string,common:Common}>{
    //special characters encoded in urls are parsed back to normal by express
    const query : string | undefined = request.query.q;
    if (!query?.trim()) throw new InvalidParamsError("q", "it should not be empty");
    
    const common = getCommonQueryParams(request);
    const courseID = request.query.courseID as string | undefined;
    const userID = request.query.userID as string | undefined;
    const submissionID = request.query.submissionID as string | undefined;

    const currentUserID = await getCurrentUserID(request);
    return { query, common: { ...common, courseID, userID, submissionID, currentUserID} };
}

async function filterUser(query : string, common : Common) {
    try {
        await requirePermissions(common.currentUserID, [PermissionEnum.viewAllUserProfiles], common.courseID);
    } catch (e){
        //this operation is not permitted. return an emtpy array.
        if (e instanceof PermissionError) {
            return []
        } else {
            throw e;
        }
    }
    const user : User = {...common, userName:query};
    return common.courseID
        ? CourseRegistrationDB.filterCourseUser(user).then(map(CourseUserToUser))
        : UserDB.filterUser(user);
}

/** Generic search */
searchRouter.get('/', capture(async (request, response) => {
    const { query, common } = await getSearchParams(request);
    if (common.courseID) { // we are searching within a course
        await requireRegistered(common.currentUserID, common.courseID);
        const users = await filterUser(query, common);
        const comments = await CommentDB.searchComments(query, common);
        const snippets = await SnippetDB.searchSnippets(query, common);
        const submissions = await SubmissionDB.searchSubmissions(query, common);
        const files = await FileDB.searchFiles(query, common);
        const result = {
            users, 
            courses: [], 
            submissions, 
            files,
            comments,
            snippets
        } as SearchResult;
        console.log("course searched. query:", query, "Found", result);
        response.send(result);
    } else {
        const courses = await CourseDB.searchCourse(query, common);
        const users = await filterUser(query, common)
        const result = {
            users, 
            courses, 
            submissions: [], 
            files: [],
            comments: [],
            snippets: []
        };
        console.log("global searched. query:", query, "Found", result);
        response.send(result);
    }
}));

/** search for courses */
searchRouter.get('/courses', capture(async (request, response) => {
    const { query, common } = await getSearchParams(request);
    if (common.courseID) {
        throw new InvalidParamsError("when searching for a course, a courseID is not allowed")
    }
    const courses = await CourseDB.searchCourse(query, common);
    response.send(courses);
}));

/** Search for users */
searchRouter.get('/users', capture(async (request, response) => {
    const { query, common } = await getSearchParams(request);
    if (common.courseID) {
        await requireRegistered(common.currentUserID, common.courseID)
    }
    const users = await filterUser(query, common);
    response.send(users);
}));

/** Search for comments */
searchRouter.get('/comments', capture(async (request, response) => {
    const { query, common } = await getSearchParams(request);
    if (!common.courseID){
        throw new InvalidParamsError("courseID", "should be given, but wasn't")
    }
    await requireRegistered(common.currentUserID, common.courseID);
    const comments = await CommentDB.searchComments(query, common);
    response.send(comments);
}));

/** Search for snippets */
searchRouter.get('/snippets', capture(async (request, response) => {
    const { query, common } = await getSearchParams(request);
    if (!common.courseID){
        throw new InvalidParamsError("courseID", "should be given, but wasn't")
    }
    await requireRegistered(common.currentUserID, common.courseID);
    const snippets = await SnippetDB.searchSnippets(query, common);
    response.send(snippets);
}));

/** search for submissions */
searchRouter.get('/submissions', capture(async (request, response) => {
    const { query, common } = await getSearchParams(request);
    if (!common.courseID){
        throw new InvalidParamsError("courseID", "should be given, but wasn't")
    }
    await requireRegistered(common.currentUserID, common.courseID);
    const submissions = await SubmissionDB.searchSubmissions(query, common);
    response.send(submissions);
}));

/** search for files */
searchRouter.get('/files', capture(async (request, response)=>{
    const { query, common } = await getSearchParams(request);
    if (!common.courseID){
        throw new InvalidParamsError("courseID", "should be given, but wasn't")
    }
    await requireRegistered(common.currentUserID, common.courseID);
    const files = await FileDB.searchFiles(query, common);
    response.send(files)
}));