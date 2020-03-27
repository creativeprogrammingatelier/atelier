import {User} from "../../../../../models/api/User";
import {Form, InputGroup} from "react-bootstrap";
import {Label} from "../../general/Label";
import React, {Fragment} from "react";

interface UserInfoProperties {
	user: User
}
export function UserInfo({user}: UserInfoProperties) {
	return <Fragment>
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
	</Fragment>;
}