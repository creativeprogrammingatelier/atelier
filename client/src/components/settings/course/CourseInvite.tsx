import React, {useState} from 'react';
import {Button, InputGroup, Form} from 'react-bootstrap';
import {FiPlus, FiX} from 'react-icons/all';

import {CourseInvite as CourseInviteModel} from '../../../../../models/api/Invite';
import {InviteRole} from '../../../../../models/enums/InviteRoleEnum';

import {deleteInviteLink, getInviteLink} from '../../../helpers/api/APIHelper';

import {LabeledInput} from '../../input/LabeledInput';

interface CourseInviteProperties {
	/** Name of labeled input of the component */
	name: string,
	/** Course Invite Link  */
	link?: string,
	/** Role that the invite link assigns to an invitee. */
	role: InviteRole
	/** Course ID the invite pertains to. */
	courseID: string,
}
/**
 * Component for generating and deleting course invites for a specified role.
 */
export function CourseInvite({name, link, role, courseID}: CourseInviteProperties) {
  const [inviteLink, setInviteLink] = useState(link ? `${window.location.origin}/invite/${link}` : '');

  /**
	 * Function for generating course invite.
	 */
  const createLink = (role: InviteRole) => {
    getInviteLink(courseID, role)
        .then((courseInvite: CourseInviteModel) => {
          setInviteLink(`${window.location.origin}/invite/${courseInvite.inviteID}`);
        });
  };
  /**
	 * Course of disabling course invite.
	 */
  const deleteLink = () => {
    deleteInviteLink(courseID, role)
        .then(() => {
          setInviteLink('');
        });
  };

  return <LabeledInput label={name}>
    <Form.Control plaintext readOnly placeholder="No invite link generated" value={inviteLink}/>
    <InputGroup.Append>
      {
				inviteLink ?
					<Button onClick={() => deleteLink()}>Remove link <FiX/></Button>					:
					<Button onClick={() => createLink(role)}>Create link <FiPlus/></Button>
      }
    </InputGroup.Append>
  </LabeledInput>;
}
