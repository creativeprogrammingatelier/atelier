import React, {Fragment} from "react";
import {useHistory} from "react-router-dom";
import {FiTrash} from "react-icons/all";

import {useCourse} from "../../../helpers/api/APIHooks";

import {ButtonMultistate} from "../../input/button/ButtonMultistate";
import {FeedbackError} from "../../feedback/FeedbackError";

interface CourseSettingsDeleteProperties {
    /** Course ID within the database */
    courseID: string
}
/**
 * Component for deleting a course.
 */
export function CourseSettingsDelete({courseID}: CourseSettingsDeleteProperties) {
    const history = useHistory();
    const course = useCourse(courseID);
    /** Do deletion of the course. */
    const handleDelete = () => {
        course.delete().then(() => history.push("/"));
    };

    return <Fragment>
        <FeedbackError>
            Deleting a course is permanent, and can not be undone.
            All the submissions and comments in this course will be gone forever.
        </FeedbackError>
        <ButtonMultistate variant="danger" states={[
            <Fragment key="delete">Delete <FiTrash/></Fragment>,
            <Fragment key="confirm">Confirm <FiTrash/></Fragment>
        ]} finish={handleDelete}/>
    </Fragment>;
}
