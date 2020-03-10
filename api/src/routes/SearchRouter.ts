/**
 * Api routes relating to course information
 *
 * /api/search?q
 * /api/course/search?q
 * /api/user/search?q
 *  - submission results
 *  - comment results
 *  - code results
 */

import express, { Response, Request } from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { UserDB } from '../database/UserDB';
import { CommentDB } from '../database/CommentDB';
import {capture} from "../helpers/ErrorHelper";
import {User} from "../../../models/api/User";
import {Comment} from "../../../models/api/Comment";
import {CommentThread} from "../../../models/api/CommentThread";
import {ThreadDB} from "../database/ThreadDB";
import {Snippet} from "../../../models/api/Snippet";
import {SnippetDB} from "../database/SnippetDB";

export const searchRouter = express.Router();

// Authentication is required for all endpoints
searchRouter.use(AuthMiddleware.requireAuth);

/**
 * Search database for users, comments
 */
searchRouter.get('/',capture(async (request : Request, response : Response) => {
    const search : string = request.params.q;
    if (!search) response.status(400).send({});

    // Search comments
    // TODO do we want to filter comments afterwards? or have a separate query?
    let comments : Comment[] = await CommentDB.filterComment({body : search});


    // Search snippets & filter view
    // TODO do we want to filter snippets afterwards? or have a separate query?
    let snippets : Snippet[] = await SnippetDB.filterSnippet({body : search});

    // Search users & filter view
    // TODO perhaps search in email/role of users?
    // TODO do we want to filter users afterwards? or have a separate query?
    const users : User[] = await UserDB.filterUser({userName : search});

    // TODO do we want to search courses?

    response.status(200).send({
        users : users,
        comments : comments,
        snippets : snippets
    });
}));
