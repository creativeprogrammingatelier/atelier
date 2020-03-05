import React, {FormEvent, useState} from "react";
import {InputField} from '../general/InputField';
import {Course} from '../../../../models/api/Course';
import { createCourse } from '../../../helpers/APIHelper';
import { courseState } from '../../../../enums/courseStateEnum';
import {Button, FormControl, InputGroup, Form} from "react-bootstrap";
import {FiClipboard} from "react-icons/all";

interface AddCourseProps {
    handleResponse? : (course : Course) => void
}

export function AddCourse({handleResponse} : AddCourseProps) {
    const [courseName, setCourseName] = useState("");

    // Create course
    async function handleSubmission(courseName : string) {
        try {
            const course : Course = await createCourse({
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
            <Form>
                <InputGroup>
                    <Form.Control type="text" placeholder="Course name" onChange={(event: React.FormEvent<HTMLInputElement>) => setCourseName((event.target as HTMLInputElement).value)}/>
                    <InputGroup.Append>
                        <Button onClick={() => handleSubmission(courseName)}>Create Course</Button>
                    </InputGroup.Append>
                </InputGroup>
                {courseName}
            </Form>
        </div>
    )
}