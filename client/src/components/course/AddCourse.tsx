import React, {FormEvent, useState} from "react";
import {InputField} from '../general/InputField';
import {Course} from '../../../../models/api/Course';
import { createCourse } from '../../../helpers/APIHelper';
import {Button, FormControl, InputGroup, Form} from "react-bootstrap";
import {FiClipboard} from "react-icons/all";
import {courseState} from "../../../../models/enums/courseStateEnum";
import { useCourses } from "../../helpers/api/APIHooks";

interface AddCourseProps {
    handleResponse? : (course : Course) => void
}

export function AddCourse({handleResponse} : AddCourseProps) {
    const [courseName, setCourseName] = useState("");
    const {createCourse} = useCourses();

    // Create course
    async function handleSubmission(courseName : string) {
        try {
            await createCourse({
                name : courseName,
                state : courseState.open
            });
            setCourseName("");
            if (handleResponse !== undefined) {
                // handleResponse(course);
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
                    <Form.Control type="text" placeholder="Course name" value={courseName} onChange={(event: React.FormEvent<HTMLInputElement>) => setCourseName((event.target as HTMLInputElement).value)}/>
                    <InputGroup.Append>
                        <Button onClick={() => handleSubmission(courseName)}>Create Course</Button>
                    </InputGroup.Append>
                </InputGroup>
                {courseName}
            </Form>
        </div>
    )
}