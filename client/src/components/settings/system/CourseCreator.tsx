import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";

import {Course} from "../../../../../models/api/Course";
import {courseState} from "../../../../../models/enums/courseStateEnum";

import {useCourses} from "../../../helpers/api/APIHooks";

import {FeedbackError} from "../../feedback/FeedbackError";
import {FeedbackContent} from "../../feedback/Feedback";
import {LabeledInput} from "../../input/LabeledInput";

interface CourseCreatorProperties {
	handleResponse?: (course: Course) => void
}

export function CourseCreator({handleResponse}: CourseCreatorProperties) {
	const [courseName, setCourseName] = useState("");
	const [error, setError] = useState(false as FeedbackContent);
	const {createCourse} = useCourses();

	// Create course
	async function handleSubmission(courseName: string) {
		try {
			await createCourse({
				name: courseName,
				state: courseState.open
			});
			setCourseName("");
			if (handleResponse !== undefined) {
				// handleResponse(course);
			}
		} catch (error) {
			setError(`Failed to create new course: ${error}`);
		}
	}

	return <Form>
		<LabeledInput label="Course name">
			<Form.Control type="text" placeholder="Course name" value={courseName} onChange={(event: React.FormEvent<HTMLInputElement>) => setCourseName((event.target as HTMLInputElement).value)}/>
			<Button onClick={() => handleSubmission(courseName)}>Create Course</Button>
		</LabeledInput>
		<FeedbackError close={setError}>{error}</FeedbackError>
	</Form>;
}