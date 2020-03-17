import React, {useState} from 'react';
import {Course, CoursePartial} from "../../../../models/api/Course";
import {courseState} from "../../../../models/enums/courseStateEnum";
import {Button, Form, InputGroup} from "react-bootstrap";

interface UpdateCourseProps {
    courseID : string,
    handleResponse : (course : Course) => void
}

export function UpdateCourse({courseID, handleResponse} : UpdateCourseProps) {
    const [courseName, setCourseName] = useState("");
    const [courseState, setCourseState] = useState("");

    function handleUpdate(courseName : string) {
        try {
            const course : CoursePartial = await courseU
        } catch (err) {
            // TODO: handle error
            console.log(err);
        }
    }

    return (
        <div className="updateCourse">
            <Form>
                <InputGroup>
                    <Form.Control
                        type="text"
                        placeholder="Course name"
                        value= {courseName}
                        onChange={(event: React.FormEvent<HTMLInputElement>) =>
                            setCourseName((event.target as HTMLInputElement).value)
                        }
                    />
                    <InputGroup.Append>
                        <Button onClick={() => handleResponse(courseName)}>Create Course</Button>
                    </InputGroup.Append>
                </InputGroup>
                {courseName}
            </Form>
        </div>
    )
}