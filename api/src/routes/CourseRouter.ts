/**
 * Api routes relating to a course
 */

import express, { Response, Request } from 'express';
import {CourseDB} from "../database/CourseDB";
import {Course} from "../../../models/database/Course";
import {courseState} from "../../../enums/courseStateEnum";
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export const courseRouter = express.Router();

// Authentication is required for all endpoints
courseRouter.use(AuthMiddleware.requireAuth);

/** Add a course. Pass parameters as json in the body.
 * @type: post
 * @url: /api/course
 * @param name (string): course name
 * @param state (courseState): state of the course
 * @param creatorID (string): userID of the creator
 * @return course created
 */
courseRouter.post('/',
    (request : Request, result : Response) => {
        const name : string = request.body.name;
        const state : courseState = request.body.state;
        const creatorID : string | undefined = request.body.creatorID;

        console.log(name, state, creatorID);

        CourseDB.addCourse({ courseName: name, state, creatorID  })
            .then((course : Course) => {
                result.send(course)
            })
            .catch((error : Error) => result.status(500).send({error}));
    });
