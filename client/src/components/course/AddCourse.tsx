import React from 'react';
import {InputField} from '../general/InputField';
import {Course} from '../../../../models/database/Course';
import { createCourse } from '../../../helpers/APIHelper';
import { courseState } from '../../../../enums/courseStateEnum';

interface AddCourseProps {
    handleResponse? : (course : Course) => void
}

export function AddCourse({handleResponse} : AddCourseProps) {
    // Create course
    async function handleSubmission(courseName : string) {
        try {
            const course = await createCourse({
                name : courseName,
                state : courseState.open
            });
            if (handleResponse !== undefined) {
                handleResponse(course);
            }
        } catch (err) {
            // TODO: handle error for the user
            console.log(err);
        }
    }

    return (
        <div className="addCourse">
            <InputField
                callBack={handleSubmission}
                buttonText={"Create Course"}
            />
        </div>
    )
}