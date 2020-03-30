import React, {useState, Fragment} from "react";
import {User} from "../../../../../models/api/User";
import {UserSearch} from "../user/UserSearch";
import {courseEnrollUser} from "../../../../helpers/APIHelper";
import {CourseUser} from "../../../../../models/api/CourseUser";
import {Button, Form, InputGroup} from "react-bootstrap";
import {UserRoles} from "../user/UserRoles";
import {courseRole} from "../../../../../models/enums/courseRoleEnum";
import {Label} from "../../general/Label";
import {UserInfo} from "../user/UserInfo";

interface CourseSettingsEnrollmentProperties {
	courseID: string
}
export function CourseSettingsEnrollment({courseID}: CourseSettingsEnrollmentProperties) {
	const [user, setUser] = useState(undefined as User | undefined);
	const [role, setRole] = useState(undefined as typeof courseRole | undefined);

	function enrollUser() {
		if (user) {
			console.log("Enrolling user");
			console.log(user);
			console.log(role);
			courseEnrollUser(courseID, user.ID)
			.then((user: CourseUser) => {
				console.log("Enrollment success");
				// TODO: Visual user feedback
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
				<UserRoles<typeof courseRole> roles={courseRole} onSelected={setRole}/>
				<Button onClick={enrollUser}>Enroll User</Button>
			</Fragment>
		}
	</Form>;
}