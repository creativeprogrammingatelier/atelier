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

import {Response, Request} from 'express';
import {SearchResponse} from "../../../client/src/helpers/DatabaseResponseInterface";

let express = require('express');
let router = express.Router();


const searchResponse : SearchResponse = {
    submissions : [{
        name : "Bird Project",
        userId : 13,
        submissionId : 1234,
        user : "Mathew Tompsen",
        date : new Date().toLocaleString(),
        state : "open",
        comments : []
    }, {
        name : "Design Project",
        userId : 123,
        submissionId : 123455,
        user : "Jake Walker",
        date : new Date().toLocaleString(),
        state : "open",
        comments : []
    }],
    files : [{
        fileId : 123,
        submissionId : 12345,
        userId : 123123,
        userName : "Paul Derksen",
        snippet : "print('hello world')"
    }, {
        fileId : 124,
        submissionId: 122,
        userId : 123123,
        userName : "Paul Derksen",
        snippet : "print hello world"
    }],
    comments : [{
        commentId : 1,
        commentThreadId : 1,
        submissionId : 123,
        submissionName : "Bird Project",
        fileId : 123,
        fileName : "main.pde",
        userId : 123,
        author : "Jake Walker",
        startLine : 3,
        startCharacter : 4,
        endLine : 4,
        endCharacter : 5,
        text : "Maybe a bit simple"
    }, {
        commentId : 1,
        commentThreadId : 1,
        submissionId : 123,
        submissionName : "Design Project",
        fileId : 123,
        fileName : "main2.pde",
        userId : 123,
        author : "Dhr. Polderman",
        startLine : 3,
        startCharacter : 4,
        endLine : 4,
        endCharacter : 5,
        text : "Pls no..."
    }]
};

router.get('/',
    (request : Request, result : Response) => {
        const search = request.params['q'];
        console.log('search parameter: ' + search);

        result.send(searchResponse);
    });

module.exports = router;