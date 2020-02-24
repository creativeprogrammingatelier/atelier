/**
 * Api routes relating to courses of a user
 */

import express, { Response, Request } from 'express';
import { CourseResponse } from "../../../client/src/helpers/DatabaseResponseInterface";
import {CourseDB} from "../database/CourseDB";
import {Course} from "../../../models/database/course";
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export const coursesRouter = express.Router();

// Authentication is required for all endpoints
coursesRouter.use(AuthMiddleware.requireAuth);

/**
 * /api/courses/
 * @return, list of courses
 */
coursesRouter.get('/',
    async (request : Request, result : Response) => {
        CourseDB.getAllCourses()
            .then((courses : Course[]) => courses.map((course : Course) => {
                return {
                   courseID : course.courseID,
                   name : course.name,
                   state : course.state,
                   creator : course.creatorID
                }
            }))
            .then(data => result.send(data))
            .catch((error => result.status(500).send({error : error})));
    });
