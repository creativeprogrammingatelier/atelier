import React, {Fragment} from "react";
import {useHistory} from "react-router-dom";
import {FiTrash} from "react-icons/all";

import {deleteCourse} from "../../../helpers/api/APIHelper";
import {useCourses} from "../../../helpers/api/APIHooks";

import {ButtonMultistate} from "../../input/button/ButtonMultistate";
import {FeedbackError} from "../../feedback/FeedbackError";

interface CourseSettingsDeleteProperties {
	courseID: string
}
export function CourseSettingsDelete({courseID}: CourseSettingsDeleteProperties) {
	const history = useHistory();
	const courses = useCourses();
	const handleDelete = () => {
		deleteCourse(courseID).then(() => {
			courses.refresh().then(() => {
				history.push("/");
			});
		});
	};

	return <Fragment>
		<FeedbackError>Deleting a course is permanent, and can not be undone. All the submissions and comments in this course will be gone forever.</FeedbackError>
		<ButtonMultistate variant="danger" states={[
			<Fragment>Delete <FiTrash/></Fragment>,
			<Fragment>Confirm <FiTrash/></Fragment>
		]} finish={handleDelete}/>
	</Fragment>;
}