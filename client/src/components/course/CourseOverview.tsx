import React from 'react';
import {Link} from "react-router-dom";

const result = {
    courses:
        [{
            name: "Module 7 - Data Structures",
            courseID: 123456,
            date: "2/12/2020",
            members: 20,
            visibility: "open"
        }, {
            name : "Module 1 - Pearls of Computer Science",
            courseID : 1234567,
            date : "2/11/2020",
            members: 2,
            visibility: "open"
        }]
};

export function CourseOverview() {
    return (
        <div>
            <h1>Course Overview</h1>
            {result.courses.map((course) => {
                return (
                    <Link to={'submissionOverview?courseID=' + course.courseID}>
                        <h4>{course.name}</h4>
                        <p>Created: {course.date}</p>
                        <p>Members: {course.members}</p>
                        <p>Visibility: {course.visibility}</p>
                    </Link>
                )
            })}
        </div>

    )
}