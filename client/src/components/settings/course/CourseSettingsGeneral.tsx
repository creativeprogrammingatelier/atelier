import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";
import {useSubscription} from "observable-hooks";
import {getErrorMessage} from "../../../../../helpers/ErrorHelper";

import {Course} from "../../../../../models/api/Course";
import {CourseState} from "../../../../../models/enums/CourseStateEnum";

import {useCourse} from "../../../helpers/api/APIHooks";
import {CacheItem, CacheState} from "../../../helpers/api/Cache";

import {FeedbackContent} from "../../feedback/Feedback";
import {FeedbackError} from "../../feedback/FeedbackError";
import {LabeledInput} from "../../input/LabeledInput";

interface CourseSettingsGeneralProperties {
    /** Course ID within database */
    courseID: string
}
/**
 * Component to manage the general setting for the given course.
 */
export function CourseSettingsGeneral({courseID}: CourseSettingsGeneralProperties) {
    const [name, setName] = useState("");
    const [state, setState] = useState(undefined as CourseState | undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false as FeedbackContent);
    const course = useCourse(courseID);

    useSubscription(course.observable, course => {
        const c = (course as CacheItem<Course>).value;
        setName(c?.name || "");
        setState(c?.state as CourseState);
        setLoading(course.state !== CacheState.Loaded);
    });

    /**
     * Function for updating the course settings.
     *
     * @throws Error when it fails to update the course.
     */
    const handleUpdate = async() => {
        await course
            .update({name, state})
            .catch(error => setError(`Failed to update course: ${getErrorMessage(error)}`));
    };

    return <Form>
        <LabeledInput label="Course name">
            <Form.Control
                type="text"
                placeholder="Course name"
                value={name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName((event.target as HTMLInputElement).value)}
            />
        </LabeledInput>
        <LabeledInput label="Course state">
            <Form.Control as="select" value={state}
                onChange={event => setState((event.target as HTMLInputElement).value as CourseState)}>
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
