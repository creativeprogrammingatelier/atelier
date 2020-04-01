import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";

import {CoursePartial} from "../../../../../models/api/Course";
import {CourseState} from "../../../../../models/enums/CourseStateEnum";

import {updateCourse} from "../../../../helpers/APIHelper";

import {FeedbackContent} from "../../feedback/Feedback";
import {FeedbackError} from "../../feedback/FeedbackError";
import {LabeledInput} from "../../input/LabeledInput";

interface CourseSettingsGeneralProperties {
	courseID: string,
	handleResponse: (course: CoursePartial) => void
}

export function CourseSettingsGeneral({courseID, handleResponse}: CourseSettingsGeneralProperties) {
	const [name, setName] = useState("");
	const [state, setState] = useState(CourseState.open);
	const [error, setError] = useState(false as FeedbackContent);

	async function handleUpdate() {
		try {
			const course: CoursePartial = await updateCourse(courseID, {
				name,
				state
			});
			setName(course.name);
			setState(course.state as CourseState);
			handleResponse(course);
		} catch (error) {
			setError(`Failed to update course: ${error}`);
		}
	}

	return <Form>
		<LabeledInput label="Course name">
			<Form.Control
				type="text"
				placeholder="Course name"
				value={name}
				onChange={(event: React.FormEvent<HTMLInputElement>) => setName((event.target as HTMLInputElement).value)}
			/>
		</LabeledInput>
		<LabeledInput label="Course state">
			<Form.Control as="select" onChange={event => setState((event.target as HTMLInputElement).value as CourseState)}>
				<option disabled selected>Select a state for this course</option>
				<option value="open">Open</option>
				<option value="hidden">Hidden</option>
				<option value="finished">Finished</option>
			</Form.Control>
		</LabeledInput>
		<FeedbackError close={setError}>{error}</FeedbackError>
		<Button onClick={handleUpdate}>Update course</Button>
	</Form>;
}