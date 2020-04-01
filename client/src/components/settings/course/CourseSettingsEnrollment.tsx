import React, {useState, Fragment} from "react";
import {Button, Form} from "react-bootstrap";

import {CourseRole} from "../../../../../models/enums/CourseRoleEnum";
import {CourseUser} from "../../../../../models/api/CourseUser";
import {User} from "../../../../../models/api/User";

import {courseEnrollUser} from "../../../../helpers/APIHelper";

import {FeedbackSuccess} from "../../feedback/FeedbackSuccess";
import {FeedbackContent} from "../../feedback/Feedback";
import {UserInfo} from "../user/UserInfo";
import {UserRoles} from "../user/UserRoles";
import {UserSearch} from "../user/UserSearch";

interface CourseSettingsEnrollmentProperties {
	courseID: string
}
export function CourseSettingsEnrollment({courseID}: CourseSettingsEnrollmentProperties) {
	const [user, setUser] = useState(undefined as User | undefined);
	const [role, setRole] = useState(undefined as typeof CourseRole | undefined);
	const [success, setSuccess] = useState(false as FeedbackContent);

	function enrollUser() {
		if (user) {
			// TODO: Also send the default role
			courseEnrollUser(courseID, user.ID)
			.then((user: CourseUser) => {
				setSuccess(`Successfully enrolled ${user.userName}`);
			});
			setUser(undefined);
		}
	}

	return <Form>
		<UserSearch onSelected={setUser}/>
		{
			user &&
			<Fragment>
				<UserInfo user={user}/>
				<UserRoles<typeof CourseRole> roles={CourseRole} onSelected={setRole}/>
				<Button onClick={enrollUser}>Enroll User</Button>
			</Fragment>
		}
		<FeedbackSuccess close={setSuccess}>{success}</FeedbackSuccess>
	</Form>;
}