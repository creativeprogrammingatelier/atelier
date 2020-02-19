/**
 * Api routes relating to user information
 *
 * /api/user/userid/submissions
 *  - list of user submissions
 */

import {Response, Request} from 'express';

let express = require('express');
let router = express.Router();

const userResponse = {
    user : {
        userId : 1,
        name : "John Doe"
    },
    submissions : [
        {
            name : "Project 1",
            submissionId : 1,
            user : "Jarik",
            userId : 1,
            date : new Date(),
            state : "open",
            comments : [{
                commentId : 1,
                commentThreadId : 1,
                userId : 1,
                author : "Jarik",
                date : new Date(),
                text : "Comment Text"
            }, {
                commentId : 2,
                commentThreadId : 1,
                userId : 1,
                author : "Jarik",
                date : new Date(),
                text : "Comment Text 2"
            }],
            files : [{
                name : "main.pde",
                fileId : 1
            }, {
                name : "main2.pde",
                fileId : 2
            }]
        }, {
            name : "Project 2",
            submissionId: 2,
            user : "Jarik",
            userId : 1,
            date : new Date(),
            state : "open",
            comments : [{
                commentId : 1,
                commentThreadId : 1,
                userId : 1,
                author : "Jarik",
                date : new Date(),
                text : "Comment Text 3"
            }, {
                commentId : 2,
                commentThreadId : 1,
                userId : 1,
                author : "Jarik",
                date : new Date(),
                text : "Comment Text 4"
            }],
            files : [{
                name : "main3.pde",
                fileId : 3
            }, {
                name : "main4.pde",
                fileId : 4
            }]
        }],
    commentThreads : [{
        commentThreadId : 1,
        name : "comment thread 1",
        comments : [{
            name : "comment 1",
            author : "Jarik",
            text : "comment text",
            userId : 1
        }]
    }]
};


router.get('/:userId/submissions',
    (request: Request, result: Response) => {
        result.send(userResponse);
    });

module.exports = router;