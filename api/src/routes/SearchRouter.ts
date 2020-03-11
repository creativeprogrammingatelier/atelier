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
import { SnippetDB } from '../database/SnippetDB';
import { SearchResult } from '../../../models/api/SearchResult';
import { capture } from '../helpers/ErrorHelper';
import { getCommonQueryParams, InvalidParamsError } from '../helpers/ParamsHelper';
import { User } from '../../../models/database/User';

export const searchRouter = express.Router();

// Authentication is required for all endpoints
searchRouter.use(AuthMiddleware.requireAuth);

// TODO: handle permissions

/** Get the parameters for a search query, throws an error if invalid */
function getSearchParams(request: Request) {
    const query = request.query.q;
    if (!query?.trim()) throw new InvalidParamsError("q", "it should not be empty");

    const common = getCommonQueryParams(request);
    const courseID = request.query.courseID as string | undefined;
    const userID = request.query.userID as string | undefined;

    return { query, common: { ...common, courseID, userID } };
}

function filterUser(user: User & { courseID?: string }) {
    return user.courseID
        ? UserDB.filterUserInCourse(user)
        : UserDB.filterUser(user);
}

/** Generic search */
searchRouter.get('/', capture(async (request, response) => {
    const { query, common } = getSearchParams(request);
    const users = await filterUser({ userName: query, ...common });
    const comments = await CommentDB.filterComment({ body: query, ...common });
    const snippets = await SnippetDB.filterSnippet({ body: query, ...common });
    response.send({ users, comments, snippets } as SearchResult);
}))

/** Search for users */
searchRouter.get('/users', capture(async (request, response) => {
    const { query, common } = getSearchParams(request);
    const users = await filterUser({ userName: query, ...common });
    response.send(users);
}));

/** Search for comments */
searchRouter.get('/comments', capture(async (request, response) => {
    const { query, common } = getSearchParams(request);
    const comments = await CommentDB.filterComment({ body: query, ...common });
    response.send(comments);
}));

/** Search for snippets */
searchRouter.get('/snippets', capture(async (request, response) => {
    const { query, common } = getSearchParams(request);
    const snippets = await SnippetDB.filterSnippet({ body: query, ...common });
    response.send(snippets);
}));