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

export const searchRouter = express.Router();

// Authentication is required for all endpoints
searchRouter.use(AuthMiddleware.requireAuth);

/**
 * Search database for users, comments
 */
searchRouter.get('/',capture(async (request : Request, response : Response) => {
    const search : string = request.params.q;
    if (!search) response.status(400).send();

    // TODO UserDB.searchUser(search) does not have the updated interface for User
    //const users : User[] = await UserDB.searchUser(search);
    const comments : Comment[] = await CommentDB.filterComment({ body : search});
    response.status(200).send({
        users : [],
        comments : comments
    });
}));
