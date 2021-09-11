import express, {Request} from "express";

import {SearchResult} from "../../../models/api/SearchResult";
import {CourseUserToUser} from "../../../models/database/CourseUser";
import {User} from "../../../models/database/User";
import {PermissionEnum} from "../../../models/enums/PermissionEnum";
import {Sorting} from "../../../models/enums/SortingEnum";

import {removePermissionsCoursePartial, removePermissionsSearchResultComments, removePermissionsSearchResultSnippets, removePermissionsSubmission, removePermissionsUser} from "../helpers/APIFilterHelper";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {capture} from "../helpers/ErrorHelper";
import {PermissionError, requirePermissions, requireRegistered} from "../helpers/PermissionHelper";
import {getCommonQueryParams, InvalidParamsError} from "../helpers/ParamsHelper";

import {CourseDB} from "../database/CourseDB";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {CommentDB} from "../database/CommentDB";
import {FileDB} from "../database/FileDB";
import {map} from "../database/HelperDB";
import {SnippetDB} from "../database/SnippetDB";
import {SubmissionDB} from "../database/SubmissionDB";
import {UserDB} from "../database/UserDB";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {TagsDB} from "../database/TagsDB";
/**
 * Routes for searching.
 * All routes accept these query parameters:
 * - q: the search query
 * - limit: the maximum number of results
 * - offset: the number of results to skip, used for paging
 * - courseID: limit the returned items to be part of this course
 * - userID: limit the returned items to be created by this user
 */

export const searchRouter = express.Router();
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
async function getSearchParams(request: Request): Promise<{query: string, common: Common}> {
    // Special characters encoded in urls are parsed back to normal by express
    const query = request.query.q as string | undefined;
    if (!query?.trim()) {
        throw new InvalidParamsError("q", "it should not be empty");
    }

    const common = getCommonQueryParams(request);
    const courseID = request.query.courseID as string | undefined;
    const userID = request.query.userID as string | undefined;
    const submissionID = request.query.submissionID as string | undefined;

    const currentUserID = await getCurrentUserID(request);
    return {query, common: {...common, courseID, userID, submissionID, currentUserID}};
}
async function filterUser(query: string, common: Common) {
    try {
        if (!common.courseID) {
            // If we are not in a course, you need permissions to view all the user profiles
            await requirePermissions(common.currentUserID, [PermissionEnum.viewAllUserProfiles]);
        } else {
            // In a course, everyone should be able to search for other users, even if they don't have
            // the viewAllUserProfiles permission, because they should be able to mention all users.
            // Actually viewing the user profile does require the permission, but listing users does not.
            await requireRegistered(common.currentUserID, common.courseID);
        }
    } catch (e) {
        // This operation is not permitted. return an empty array.
        if (e instanceof PermissionError) {
            return [];
        } else {
            throw e;
        }
    }
    const user: User = {...common, userName: query};
    const result = common.courseID
        ? await CourseRegistrationDB.filterCourseUser(user).then(map(CourseUserToUser))
        : await UserDB.filterUser(user);
    return result.map(removePermissionsUser);
}

/** Generic search */
searchRouter.get("/", capture(async(request, response) => {
    const {query, common} = await getSearchParams(request);
    if (common.courseID) {
        // we are searching within a course
        await requireRegistered(common.currentUserID, common.courseID);
        const users = await filterUser(query, common);
        const comments = await CommentDB.searchComments(query, common);
        const snippets = await SnippetDB.searchSnippets(query, common);
        const submissions = await SubmissionDB.searchSubmissions(query, common);
        const files = await FileDB.searchFiles(query, common);
        const result = {
            users,
            courses: [],
            submissions: submissions.map(submission => removePermissionsSubmission(submission)),
            files,
            comments: removePermissionsSearchResultComments(comments),
            snippets: removePermissionsSearchResultSnippets(snippets)
        } as SearchResult;
        console.log("course searched. query:", query, "Found", result);
        response.send(result);
    } else {
        // Global search outside of a course
        const courses = await CourseDB.searchCourse(query, common);
        const users = await filterUser(query, common);
        const result = {
            users,
            courses: courses.map(course => removePermissionsCoursePartial(course)),
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
searchRouter.get("/courses", capture(async(request, response) => {
    const {query, common} = await getSearchParams(request);
    if (common.courseID) {
        throw new InvalidParamsError("When searching for a course, a courseID is not allowed");
    }
    const courses = (await CourseDB.searchCourse(query, common))
        .map(course => removePermissionsCoursePartial(course));
    response.send(courses);
}));

/** Search for users */
searchRouter.get("/users", capture(async(request, response) => {
    const {query, common} = await getSearchParams(request);
    if (common.courseID) {
        await requireRegistered(common.currentUserID, common.courseID);
    }
    const users = await filterUser(query, common);
    response.send(users);
}));

/** get the most used tags tags */
searchRouter.get("/tags", capture(async(request, response) => {
    const tags = await TagsDB.getMostUsedTags(10);
    response.send(tags);
}));

/** Search for comments */
searchRouter.get("/comments", capture(async(request, response) => {
    const {query, common} = await getSearchParams(request);
    if (!common.courseID) {
        throw new InvalidParamsError("courseID", "should be given, but wasn't");
    }
    await requireRegistered(common.currentUserID, common.courseID);
    const comments = await CommentDB.searchComments(query, common);
    response.send(removePermissionsSearchResultComments(comments));
}));

/** Search for snippets */
searchRouter.get("/snippets", capture(async(request, response) => {
    const {query, common} = await getSearchParams(request);
    if (!common.courseID) {
        throw new InvalidParamsError("courseID", "should be given, but wasn't");
    }
    await requireRegistered(common.currentUserID, common.courseID);
    const snippets = await SnippetDB.searchSnippets(query, common);
    response.send(removePermissionsSearchResultSnippets(snippets));
}));

/** search for submissions */
searchRouter.get("/submissions", capture(async(request, response) => {
    const {query, common} = await getSearchParams(request);
    if (!common.courseID) {
        throw new InvalidParamsError("courseID", "should be given, but wasn't");
    }
    await requireRegistered(common.currentUserID, common.courseID);
    const submissions = (await SubmissionDB.searchSubmissions(query, common))
        .map(submission => removePermissionsSubmission(submission));
    response.send(submissions);
}));

/** search for files */
searchRouter.get("/files", capture(async(request, response) => {
    const {query, common} = await getSearchParams(request);
    if (!common.courseID) {
        throw new InvalidParamsError("courseID", "should be given, but wasn't");
    }
    await requireRegistered(common.currentUserID, common.courseID);
    const files = await FileDB.searchFiles(query, common);
    response.send(files);
}));
