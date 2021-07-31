import React, {Fragment} from "react";

import {Invite} from "../../../../../models/api/Invite";
import {Permission} from "../../../../../models/api/Permission";
import {InviteRole} from "../../../../../models/enums/InviteRoleEnum";

import {coursePermission, getInviteLinks} from "../../../helpers/api/APIHelper";

import {Loading} from "../../general/loading/Loading";
import {CourseInvite} from "./CourseInvite";

interface CourseSettingsInvitesProperties {
	/** ID of course in database */
	courseID: string
}
/**
 * Components for creating a course invite for a student, TA and a teacher to a given course.
 */
export function CourseSettingsInvites({courseID}: CourseSettingsInvitesProperties) {
	return <Loading<[Permission, Invite]>
		loader={(courseID: string) => Promise.all([coursePermission(courseID), getInviteLinks(courseID)])}
		params={[courseID]}
		component={(response: [Permission, Invite]) =>
			<Fragment>
				<CourseInvite name="Invite a student" link={response[1].student} role={InviteRole.student} courseID={courseID}/>
				<CourseInvite name="Invite a teaching assistant" link={response[1].TA} role={InviteRole.TA} courseID={courseID}/>
				<CourseInvite name="Invite a teacher" link={response[1].teacher} role={InviteRole.teacher} courseID={courseID}/>
			</Fragment>
		}
	/>;
}