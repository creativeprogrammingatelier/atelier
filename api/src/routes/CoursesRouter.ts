/**
 * Api routes relating to courses of a user
 */

import express, { Response, Request } from 'express';
import { CourseResponse } from "../../../client/src/helpers/DatabaseResponseInterface";
import {CourseDB} from "../database/CourseDB";
import {Course} from "../../../models/course";

export const coursesRouter = express.Router();

const courseListResponse = {
    courses: [
        {
            courseId : 1,
            name : 'Pearls of Computer Science',
            state : 'open',
            creator : 'Jarik'
        },
        {
            courseId : 2,
            name : 'Software Systems',
            state : 'open',
            creator : 'Jarik'
        },
        {
            courseId : 3,
            name : 'Network Systems',
            state : 'open',
            creator : 'Jarik'
        },
        {
            courseId : 4,
            name : 'Data and Information',
            state : 'open',
            creator : 'Jarik'
        },
        {
            courseId : 5,
            name : 'Computer Systems',
            state : 'open',
            creator : 'Jarik'
        },
        {
            courseId : 6,
            name : 'Intelligent Interaction Design',
            state : 'open',
            creator : 'Jarik'
        },
        {
            courseId : 7,
            name : 'Discrete Structures & Efficient Algorithms',
            state : 'open',
            creator : 'Jarik'
        },
        {
            courseId : 8,
            name : 'Programming Paradigms',
            state : 'open',
            creator : 'Jarik'
        }
    ]
};

/**
 * /api/course/
 * @return, list of courses
 */
coursesRouter.get('/',
    (request : Request, result : Response) => {
        /*const courses = CoursesHelper.getAllCourses()
            .then((courses : Course[]) => courses.map((course : Course) => {
                return {
                    courseId : course.courseID,
                    name : course.name,
                    state : course.state,
                    creator : course.creatorID
                }
            }));*/
        result.send(courseListResponse);
    });
