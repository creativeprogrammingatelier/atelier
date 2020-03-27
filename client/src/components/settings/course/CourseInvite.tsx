import {inviteRole} from "../../../../../models/enums/inviteRoleEnum";
import React, {useState} from "react";
import {deleteInvite, getInvite} from "../../../../helpers/APIHelper";
import {CourseInvite as CourseInviteModel} from "../../../../../models/api/Invite";
import {Button, InputGroup, Form} from "react-bootstrap";
import {FiPlus, FiX} from "react-icons/all";
import {Label} from "../../general/Label";

interface CourseInviteProperties {
	name: string,
	link?: string,
	role: inviteRole
	courseID: string,
}
export function CourseInvite({name, link, role, courseID}: CourseInviteProperties) {
	const [inviteLink, setInviteLink] = useState(link ? window.location.origin + link : "");

	const createLink = (role: inviteRole) => {
		getInvite(courseID, role)
		.then((courseInvite: CourseInviteModel) => {
			setInviteLink(window.location.origin + `/api/invite/${courseInvite.inviteID}`);
		});
	};

	const deleteLink = () => {
		deleteInvite(courseID, role)
		.then(() => {
			setInviteLink("");
		});
	};

	return <Form.Label className="w-100">
		<Label>{name}</Label>
		<InputGroup>
			<Form.Control plaintext readOnly placeholder="No invite link generated" value={inviteLink}/>
			<InputGroup.Append>
				{inviteLink ?
					<Button onClick={() => deleteLink()}>Remove link <FiX/></Button>
					:
					<Button onClick={() => createLink(role)}>Create link <FiPlus/></Button>
				}
			</InputGroup.Append>
		</InputGroup>
	</Form.Label>;
}