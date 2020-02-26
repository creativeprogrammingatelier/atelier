import React from 'react';
import {InputField} from '../general/InputField';
import {Course} from '../../../../models/database/Course';
import { Fetch } from '../../../helpers/FetchHelper';

interface AddCourseProps {
    handleResponse? : (course : Course) => void
}

export function AddCourse({handleResponse} : AddCourseProps) {
    // Create course
    async function createCourse(courseName : string) {
        try {
            const course = await Fetch.fetchJson<Course>('/api/course', {
                method : 'POST',
                body : JSON.stringify({
                    name : courseName,
                    state : 'open',
                })
            });
            handleResponse(course);
        } catch (err) {
            // TODO: handle error for the user
            console.log(err);
        }
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