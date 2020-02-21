/**
 * Api routes relating to a course
 */

import express, { Response, Request } from 'express';
import CoursesHelper from "../database/CoursesHelper";
import {Course} from "../../../models/course";
import {courseState} from "../../../enums/courseStateEnum";

export const courseRouter = express.Router();



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
        const creatorID : number = request.body.creatorID;

        CoursesHelper.addCourse({ name, state, creatorID  })
            .then((course : Course) => {
                result.send(course)
            })
            .catch(error => result.status(500).send({error : error}));
    });