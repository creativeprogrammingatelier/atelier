/**
 * Api routes relating to a course
 */

import {Response, Request} from 'express';

let express = require('express');
let router = express.Router();

const courseSubmissions = {
    submissions: [
        {
            user: "John Doe",
            name: "Uploaded helpitbroke.zip",
            time: new Date(),
            tags: [{name : "help", color : "red", dark: true}, {name : "me", color : "red", dark: true}, {name : "now", color : "red", dark: true}]},
        {
            user: "John Doe",
            name: "Uploaded Project 'ImDaBest'",
            time: new Date(2020, 1, 17, 15).toLocaleString(),
            tags: [{name : "fuck", color : "green", dark: true}, {name : "yeah", color : "green", dark: true}]
        },
        {
            user: "Mary Doe",
            name: "Uploaded project 'ImmaDropOutNow",
            time: new Date(2020, 0, 9 , 15).toLocaleString(),
            tags: [{name : "fuck", color : "orange"}, {name : "off", color : "orange"}]
        }
    ]
};

/**
 * /api/course/:courseId/submissions
 */
router.get('/:courseId/submissions',
    (request: Request, result: Response) => {
        result.send(courseSubmissions);
    });

module.exports = router;