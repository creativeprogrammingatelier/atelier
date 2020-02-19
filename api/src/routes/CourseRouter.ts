/**
 * Api routes relating to a course
 */

import express, { Response, Request } from 'express';

export const courseRouter = express.Router();

const courseSubmissions = {
    submissions: [
        {
            user: "John Doe",
            name: "Uploaded helpitbroke.zip",
            time: new Date().toLocaleString(),
            tags: [{name : "help", color : "red"}, {name : "me", color : "red"}, {name : "now", color : "red"}]},
        {
            user: "John Doe",
            name: "Uploaded Project 'ImDaBest'",
            time: new Date(2020, 1, 17, 15).toLocaleString(),
            tags: [{name : "fuck", color : "green"}, {name : "yeah", color : "green"}]
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
