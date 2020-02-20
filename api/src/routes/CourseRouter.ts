/**
 * Api routes relating to a course
 */

import express, { Response, Request } from 'express';
import CoursesHelper from "../database/CoursesHelper";
import {Course} from "../../../models/course";
import {courseState} from "../../../enums/courseStateEnum";

export const courseRouter = express.Router();

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

/** Get submissions of a course
 * @type: get
 * @url: /api/course/:courseId/submissions
 * @return: submissions of a certain course
 */
courseRouter.get('/:courseId/submissions',
    (request: Request, result: Response) => {
        // TODO return submissions by ID
        result.send(courseSubmissions);
    });

/** Add a course. Pass parameters as json in the body.
 * @type: post
 * @url: /api/course
 * @param name (string): course name
 * @param state (courseState): state of the course
 * @param creatorID (number): userID of the creator
 * @return course created
 */
courseRouter.post('/',
    (request : Request, result : Response) => {
        const name : string = request.body.name;
        const state : courseState = request.body.state;
        const creatorID : number = request.body.number;

        CoursesHelper.addCourse({ name, state, creatorID  })
            .then((course : Course) => {
                result.send(course)
            })
            .catch(error => result.status(500).send({error : error}));
    });