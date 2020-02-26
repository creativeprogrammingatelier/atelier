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
import { SearchResponse } from "../../../client/src/helpers/DatabaseResponseInterface";
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { UserDB } from '../database/UserDB';
import { CommentDB } from '../database/CommentDB';

export const searchRouter = express.Router();

// Authentication is required for all endpoints
searchRouter.use(AuthMiddleware.requireAuth);

const searchResponse : SearchResponse = {
    submissions : [{
        name : "Bird Project",
        userId : "13",
        submissionId : "1234",
        user : "Mathew Tompsen",
        date : new Date().toLocaleString(),
        state : "open",
        comments : []
    }, {
        name : "Design Project",
        userId : "123",
        submissionId : "123455",
        user : "Jake Walker",
        date : new Date().toLocaleString(),
        state : "open",
        comments : []
    }],
    files : [{
        fileId : "123",
        submissionId : "12345",
        userId : "123123",
        userName : "Paul Derksen",
        snippet : "print('hello world')"
    }, {
        fileId : "124",
        submissionId: "122",
        userId : "123123",
        userName : "Paul Derksen",
        snippet : "print hello world"
    }],
    comments : [{
        commentId : "1",
        commentThreadId : "1",
        submissionId : "123",
        submissionName : "Bird Project",
        fileId : "123",
        fileName : "main.pde",
        userId : "123",
        author : "Jake Walker",
        startLine : 3,
        startCharacter : 4,
        endLine : 4,
        endCharacter : 5,
        text : "Maybe a bit simple"
    }, {
        commentId : "1",
        commentThreadId : "1",
        submissionId : "123",
        submissionName : "Design Project",
        fileId : "123",
        fileName : "main2.pde",
        userId : "123",
        author : "Dhr. Polderman",
        startLine : 3,
        startCharacter : 4,
        endLine : 4,
        endCharacter : 5,
        text : "Pls no..."
    }]
};

searchRouter.get('/:q',
    async (request : Request, result : Response) => {
        const search = request.params['q'];
        if (!search){
            result.status(400).send();
        }
        const users = await UserDB.searchUser(search);
        const comments = await CommentDB.textSearch(search);
        process.stdout.write('search parameter: ' + search);
        process.stdout.write('search user result'+ users)
        process.stdout.write('search comment result'+ comments)
        result.send({...searchResponse,comments, users});
        // result.send(searchResponse);
    });
