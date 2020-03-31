import React, {useState} from "react";
import {Button, InputGroup, Form} from "react-bootstrap";
import {FiPlus, FiX} from "react-icons/all";
import {CourseInvite as CourseInviteModel} from "../../../../../models/api/Invite";
import {inviteRole} from "../../../../../models/enums/inviteRoleEnum";
import {deleteInvite, getInvite} from "../../../../helpers/APIHelper";
import {LabeledInput} from "../../input/LabeledInput";

interface CourseInviteProperties {
	name: string,
	link?: string,
	role: inviteRole
	courseID: string,
}
export function CourseInvite({name, link, role, courseID}: CourseInviteProperties) {
	const [inviteLink, setInviteLink] = useState(link ? `${window.location.origin}/invite/${link}` : "");

	const createLink = (role: inviteRole) => {
		getInvite(courseID, role)
		.then((courseInvite: CourseInviteModel) => {
			setInviteLink(`${window.location.origin}/invite/${courseInvite.inviteID}`);
		});
	};

	const deleteLink = () => {
		deleteInvite(courseID, role)
		.then(() => {
			setInviteLink("");
		});
	};

	return <LabeledInput label={name}>
		<Form.Control plaintext readOnly placeholder="No invite link generated" value={inviteLink}/>
		<InputGroup.Append>
			{inviteLink ?
				<Button onClick={() => deleteLink()}>Remove link <FiX/></Button>
				:
				<Button onClick={() => createLink(role)}>Create link <FiPlus/></Button>
			}
		</InputGroup.Append>
	</LabeledInput>;
}