import React, {useState, Fragment} from "react";
import {Button, Form} from "react-bootstrap";

import {CourseUser} from "../../../../../models/api/CourseUser";
import {User} from "../../../../../models/api/User";

import {courseDisenrollUser} from "../../../helpers/api/APIHelper";
import {FeedbackContent} from "../../feedback/Feedback";
import {FeedbackSuccess} from "../../feedback/FeedbackSuccess";

import {UserSearch} from "../user/UserSearch";
import {UserInfo} from "../user/UserInfo";

interface CourseSettingsDisenrollmentProperties {
	/** Course ID withing database */
	courseID: string
}
/**
 * Component for disenrolling user from a course. 
 */
export function CourseSettingsDisenrollment({courseID}: CourseSettingsDisenrollmentProperties) {
	const [user, setUser] = useState(undefined as User | undefined);
	const [success, setSuccess] = useState(false as FeedbackContent);
	
	/**
	 * Disenrolls user from course.
	 */
	function disenrollUser() {
		if (user) {
			courseDisenrollUser(courseID, user.ID)
				.then((user: CourseUser) => {
					setSuccess(`Successfully disenrolled ${user.userName}`);
				});
			setUser(undefined);
		}
	}
	
	return <Form>
		<UserSearch courseID={courseID} onSelected={setUser}/>
		{
			user &&
			<Fragment>
				<UserInfo user={user}/>
				<Button onClick={disenrollUser}>Disenroll User</Button>
			</Fragment>
		}
		<FeedbackSuccess close={setSuccess}>{success}</FeedbackSuccess>
	</Form>;
}