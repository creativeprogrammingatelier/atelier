/**
 * Api routes relating to courses of a user
 */

import express, { Response, Request } from 'express';
import { CourseResponse } from "../../../client/src/helpers/DatabaseResponseInterface";
import CoursesHelper from "../database/CoursesHelper";
import {Course} from "../../../models/course";

export const coursesRouter = express.Router();

/**
 * /api/courses/
 * @return, list of courses
 */
coursesRouter.get('/',
    async (request : Request, result : Response) => {
        CoursesHelper.getAllCourses()
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
