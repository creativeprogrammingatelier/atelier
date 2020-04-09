import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";

import {Course} from "../../../../../models/api/Course";
import {CourseState} from "../../../../../models/enums/CourseStateEnum";

import {FeedbackContent} from "../../feedback/Feedback";
import {FeedbackError} from "../../feedback/FeedbackError";
import {LabeledInput} from "../../input/LabeledInput";
import {useCourse} from "../../../helpers/api/APIHooks";
import {useSubscription} from "observable-hooks";
import {CacheItem, CacheState} from "../../../helpers/api/Cache";

interface CourseSettingsGeneralProperties {
	courseID: string
}

export function CourseSettingsGeneral({courseID}: CourseSettingsGeneralProperties) {
    const course = useCourse(courseID);

	const [name, setName] = useState("");
    const [state, setState] = useState(undefined as CourseState | undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false as FeedbackContent);
    
    useSubscription(course.observable, course => {
        const c = (course as CacheItem<Course>).value;
        setName(c?.name || "");
        setState(c?.state as CourseState);
        setLoading(course.state !== CacheState.Loaded);
    });

	async function handleUpdate() {
        course.update({ name, state })
            .catch(error => setError(`Failed to update course: ${error}`));
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
				<option disabled value={undefined}>Select a state for this course</option>
				<option value="open">Open</option>
				<option value="hidden">Hidden</option>
				<option value="finished">Finished</option>
			</Form.Control>
		</LabeledInput>
		<FeedbackError close={setError}>{error}</FeedbackError>
		<Button onClick={handleUpdate} disabled={loading}>Update course</Button>
	</Form>;
}