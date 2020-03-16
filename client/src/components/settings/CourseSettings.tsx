import React from 'react';
import {useState} from "react";

export function CourseSettings() {
    const [reload, setReload] = useState(false);
    // if view all courses => get all courses

    // view courses with manageUserPermissionsManager
    // view courses with manageUserRole

    return (
        <div>
            <h1>Course settings</h1>
            <p>List of courses</p>
            <p>Change course name</p>
            <p>Change user role / permissions in course</p>
        </div>


    )
}