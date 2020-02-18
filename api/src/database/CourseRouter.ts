/**
 * Api routes relating to course information
*/

import {Response, Request} from 'express';

let express = require('express');
let router = express.Router();

const courseListResponse = {
    courses: [
        {
            courseid : 1,
            name : 'Pearls of Computer Science'
        },
        {
            courseid : 2,
            name : 'Software Systems'
        },
        {
            courseid : 3,
            name : 'Network Systems'
        },
        {
            courseid : 4,
            name : 'Data and Information'
        },
        {
            courseid : 5,
            name : 'Computer Systems'
        },
        {
            courseid : 6,
            name : 'Intelligent Interaction Design'
        },
        {
            courseid : 7,
            name : 'Discrete Structures & Efficient Algorithms'
        },
        {
            courseid : 8,
            name : 'Programming Paradigms'
        }
    ]
};


router.get('/:courseId',
    (request : Request, result : Response) => {
        result.send(courseListResponse);
});

module.exports = router;