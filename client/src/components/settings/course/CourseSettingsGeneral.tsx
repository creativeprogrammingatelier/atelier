import React, {useState} from "react";
import {CoursePartial} from "../../../../../models/api/Course";
import {CourseState} from "../../../../../models/enums/courseStateEnum";
import {Button, Form} from "react-bootstrap";
import {updateCourse} from "../../../../helpers/APIHelper";
import {Label} from "../../general/Label";

interface CourseSettingsGeneralProperties {
	courseID: string,
	handleResponse: (course: CoursePartial) => void
}

export function CourseSettingsGeneral({courseID, handleResponse}: CourseSettingsGeneralProperties) {
	const [name, setName] = useState("");
	const [state, setState] = useState(CourseState.open);

	async function handleUpdate() {
		try {
			const course: CoursePartial = await updateCourse(courseID, {
				name,
				state
			});
			setName(course.name);
			setState(course.state as CourseState);
			handleResponse(course);
		} catch (err) {
			// TODO: handle error
			console.log(err);
		}
	}

	return <Form>
		<Form.Label className="w-100">
			<Label>Course name</Label>
			<Form.Control
				type="text"
				placeholder="Course name"
				value={name}
				onChange={(event: React.FormEvent<HTMLInputElement>) => setName((event.target as HTMLInputElement).value)}
			/>
		</Form.Label>
		<Form.Label className="w-100">
			<Label>Course state</Label>
			<Form.Control as="select" onChange={event => setState((event.target as HTMLInputElement).value as CourseState)}>
				<option disabled selected>Select a state for this course</option>
				<option value="open">Open</option>
				<option value="hidden">Hidden</option>
				<option value="finished">Finished</option>
			</Form.Control>
		</Form.Label>
		<Button onClick={handleUpdate}>Update Course</Button>
	</Form>;
}