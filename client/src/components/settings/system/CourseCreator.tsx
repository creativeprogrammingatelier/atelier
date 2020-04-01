import React, {useState} from "react";
import {Button, InputGroup, Form} from "react-bootstrap";
import { useCourses } from "../../../helpers/api/APIHooks";
import {Course} from '../../../../../models/api/Course';
import {courseState} from "../../../../../models/enums/courseStateEnum";
import {LabeledInput} from "../../input/LabeledInput";

interface AddCourseProps {
    handleResponse? : (course : Course) => void
}

export function CourseCreator({handleResponse} : AddCourseProps) {
    const [courseName, setCourseName] = useState("");
    const courses = useCourses();

    // Create course
    async function handleSubmission(courseName : string) {
        try {
            await courses.create({
                name : courseName,
                state : courseState.open
            });
            setCourseName("");
            if (handleResponse !== undefined) {
                // handleResponse(course);
            }
        } catch (error) {
            // TODO: handle error for the user
            console.log(error);
        }
    }

    return <Form>
        <LabeledInput label="Course name">
            <Form.Control type="text" placeholder="Course name" value={courseName} onChange={(event: React.FormEvent<HTMLInputElement>) => setCourseName((event.target as HTMLInputElement).value)}/>
            <Button onClick={() => handleSubmission(courseName)}>Create Course</Button>
        </LabeledInput>
    </Form>;
}