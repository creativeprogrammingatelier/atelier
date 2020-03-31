import React, {useState} from "react";
import {CoursePartial} from "../../../../../models/api/Course";
import {courseState} from "../../../../../models/enums/courseStateEnum";
import {Button, Form} from "react-bootstrap";
import {updateCourse} from "../../../../helpers/APIHelper";
import {Label} from "../../general/Label";
import {LabeledInput} from "../../input/LabeledInput";

interface CourseSettingsGeneralProperties {
	courseID: string,
	handleResponse: (course: CoursePartial) => void
}

export function CourseSettingsGeneral({courseID, handleResponse}: CourseSettingsGeneralProperties) {
	const [name, setName] = useState("");
	const [state, setState] = useState(courseState.open);

	async function handleUpdate() {
		try {
			const course: CoursePartial = await updateCourse(courseID, {
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
			<Form.Control as="select" onChange={event => setState((event.target as HTMLInputElement).value as courseState)}>
				<option disabled selected>Select a state for this course</option>
				<option value="open">Open</option>
				<option value="hidden">Hidden</option>
				<option value="finished">Finished</option>
			</Form.Control>
		</LabeledInput>
		<Button onClick={handleUpdate}>Update Course</Button>
	</Form>;
}