/**
 * Api routes relating to courses of a user
 */

import {Response, Request} from 'express';
import {CourseResponse} from "../../../client/src/helpers/DatabaseResponseInterface";

let express = require('express');
let router = express.Router();

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
router.get('/',
    (request : Request, result : Response) => {
        result.send(courseListResponse);
    });

module.exports = router;