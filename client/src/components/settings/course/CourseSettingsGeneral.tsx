import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";

import {Course, CoursePartial} from "../../../../../models/api/Course";
import {CourseState} from "../../../../../models/enums/CourseStateEnum";

import {updateCourse} from "../../../../helpers/APIHelper";

import {FeedbackContent} from "../../feedback/Feedback";
import {FeedbackError} from "../../feedback/FeedbackError";
import {LabeledInput} from "../../input/LabeledInput";

interface CourseSettingsGeneralProperties {
	course: CoursePartial
}

export function CourseSettingsGeneral({course}: CourseSettingsGeneralProperties) {
	const [name, setName] = useState(course.name);
	const [state, setState] = useState(course.state as CourseState);
	const [error, setError] = useState(false as FeedbackContent);

	async function handleUpdate() {
		try {
			const updatedCourse : CoursePartial = await updateCourse(course.ID, {
				name,
				state
			});
			setName(updatedCourse.name);
			setState(updatedCourse.state as CourseState);
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
			<Form.Control as="select" value={state} onChange={event => setState((event.target as HTMLInputElement).value as CourseState)}>
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