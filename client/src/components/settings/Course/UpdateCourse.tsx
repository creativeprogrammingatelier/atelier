import React, {useState} from 'react';
import {Course, CoursePartial} from "../../../../../models/api/Course";
import {courseState} from "../../../../../models/enums/courseStateEnum";
import {Button, Form, InputGroup} from "react-bootstrap";
import {updateCourse} from "../../../../helpers/APIHelper";

interface UpdateCourseProps {
    courseID : string,
    handleResponse : (course : CoursePartial) => void
}

export function UpdateCourse({courseID, handleResponse} : UpdateCourseProps) {
    const [name, setName] = useState("");
    const [state, setState] = useState(courseState.open);

    async function handleUpdate() {
        try {
            const course : CoursePartial = await updateCourse(courseID, {
                name,
                state
            });
            setName(course.name);
            setState(course.state as courseState);
            handleResponse(course);
        } catch (err) {
            // TODO: handle error
            console.log(err);
        }
    }

    return (
        <div className="updateCourse">
            <Form>
                <Form.Control
                    type="text"
                    placeholder="Course name"
                    value= {name}
                    onChange={(event: React.FormEvent<HTMLInputElement>) =>
                        setName((event.target as HTMLInputElement).value)
                    }
                />
                <br />
                <label>
                    Course State:
                    <select
                        onChange={(e) => setState(e.target.value as courseState)}
                    >
                        <option value="open">open</option>
                        <option value="hidden">hidden</option>
                        <option value="finished">finished</option>
                    </select>
                </label>

                <InputGroup.Append>
                    <Button onClick={handleUpdate}>Update Course</Button>
                </InputGroup.Append>
            </Form>
        </div>
    )
}