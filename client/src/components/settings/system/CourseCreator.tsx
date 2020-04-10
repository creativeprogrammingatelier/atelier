import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";

import {CourseState} from "../../../../../models/enums/CourseStateEnum";
import {useHistory} from "react-router-dom";
import {useCourses} from "../../../helpers/api/APIHooks";

import {FeedbackError} from "../../feedback/FeedbackError";
import {FeedbackContent} from "../../feedback/Feedback";
import {LabeledInput} from "../../input/LabeledInput";

export function CourseCreator() {
    const [courseName, setCourseName] = useState("");
    const [error, setError] = useState(false as FeedbackContent);
    const courses = useCourses();
    const history = useHistory();

    // Create course
    async function handleSubmission(courseName: string) {
        try {
            const course = await courses.create({
                name: courseName,
                state: CourseState.open
            });
            setCourseName("");
            history.push(`/course/${course.ID}/settings`);
        } catch (error) {
            setError(`Failed to create new course: ${error}`);
        }
    }

    return <Form>
        <LabeledInput label="Course name">
            <Form.Control type="text" placeholder="Course name" value={courseName}
                          onChange={(event: React.FormEvent<HTMLInputElement>) => setCourseName((event.target as HTMLInputElement).value)}/>
            <Button onClick={() => handleSubmission(courseName)}>Create Course</Button>
        </LabeledInput>
        <FeedbackError close={setError}>{error}</FeedbackError>
    </Form>;
}