import React, {useState} from 'react';
import {InputField} from "../general/InputField";
import {Course} from "../../../../models/database/Course";
import AuthHelper from './../../../helpers/AuthHelper';

interface AddCourseProps {
    handleResponse? : (course : Course) => void
}

export function AddCourse({handleResponse} : AddCourseProps) {
    // Create course
    function createCourse(courseName : string) {
        // TODO pass token so backend can get userID
        AuthHelper.fetch('/api/course', {
            method : 'POST',
            body : JSON.stringify({
                name : courseName,
                state : 'open',
            })
        })
            .then(response => response.json())
            .then((course : Course) => {
                if (handleResponse) {
                    handleResponse(course);
                }
            });
    }

    return (
        <div className="addCourse">
            <InputField
                callBack={createCourse}
                buttonText={"Create Course"}
            />
        </div>
    )
}