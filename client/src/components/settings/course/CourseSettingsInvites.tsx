import React, {Fragment} from "react";
import {Invite} from "../../../../../models/api/Invite";
import {Permission} from "../../../../../models/api/Permission";
import {InviteRole} from "../../../../../models/enums/inviteRoleEnum";
import {coursePermission, getInvites} from "../../../../helpers/APIHelper";
import {Loading} from "../../general/loading/Loading";
import {CourseInvite} from "./CourseInvite";

interface CourseSettingsInvitesProperties {
	courseID: string
}
export function CourseSettingsInvites({courseID}: CourseSettingsInvitesProperties) {
	return (
		<Loading<[Permission, Invite]>
			loader={(courseID: string) => Promise.all([coursePermission(courseID), getInvites(courseID)])}
			params={[courseID]}
			component={(response: [Permission, Invite]) =>
				<Fragment>
					<CourseInvite name="Invite a student" link={response[1].student} role={InviteRole.student} courseID={courseID}/>
					<CourseInvite name="Invite a teaching assistant" link={response[1].TA} role={InviteRole.TA} courseID={courseID}/>
					<CourseInvite name="Invite a teacher" link={response[1].teacher} role={InviteRole.teacher} courseID={courseID}/>
				</Fragment>
			}
		/>
	);
}