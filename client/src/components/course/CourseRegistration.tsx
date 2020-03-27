import React, {useState, Fragment, useEffect} from "react";
import {User} from "../../../../models/api/User";
import {MentionSuggestions} from "../comment/MentionSuggestions";
import {UserSearch} from "../settings/user/UserSearch";
import {courseEnrollUser} from "../../../helpers/APIHelper";
import {CourseUser} from "../../../../models/api/CourseUser";
import {Button, Form, InputGroup} from "react-bootstrap";
import {UserRoles} from "../settings/user/UserRoles";
import {courseRole} from "../../../../models/enums/courseRoleEnum";
import {Label} from "../general/Label";

export function CourseRegistration({courseID}: {courseID: string}) {
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
				<Form.Label className="w-50 pr-1">
					<Label>Name</Label>
					<InputGroup>
						<Form.Control plaintext readOnly placeholder="Name" value={user.name}/>
					</InputGroup>
				</Form.Label>
				<Form.Label className="w-50 pl-1">
					<Label>Email</Label>
					<InputGroup>
						<Form.Control plaintext readOnly placeholder="Email" value={user.email}/>
					</InputGroup>
				</Form.Label>
				<UserRoles<typeof courseRole> roles={courseRole} onSelected={setRole}/>
				<Button onClick={enrollUser}>Enroll User</Button>
			</Fragment>
		}
	</Form>;
}