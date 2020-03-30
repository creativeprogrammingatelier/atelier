import React, {Fragment, useEffect, useState} from "react";
import {Jumbotron} from "react-bootstrap";
import {Course, CoursePartial} from "../../../../../models/api/Course";
import {Permission} from "../../../../../models/api/Permission";
import {courseRole} from "../../../../../models/enums/courseRoleEnum";
import {containsPermission, PermissionEnum} from "../../../../../models/enums/permissionEnum";
import {coursePermission, getCourse} from "../../../../helpers/APIHelper";
import {DataList} from "../../data/DataList";
import {Frame} from "../../frame/Frame";
import {Loading} from "../../general/loading/Loading";
import {Permissions} from "../../general/Permissions";
import {UserSettingsPermissions} from "../user/UserSettingsPermissions";
import {UserSettingsRoles} from "../user/UserSettingsRoles";
import {CourseSettingsEnrollment} from "./CourseSettingsEnrollment";
import {CourseSettingsInvites} from "./CourseSettingsInvites";
import {CourseSettingsGeneral} from "./CourseSettingsGeneral";

interface CourseOverviewProps {
	match: {
		params: {
			courseId: string
		}
	}
}

export function CourseSettings({match: {params: {courseId}}}: CourseOverviewProps) {
	const [reload, updateReload] = useState(0);
	const [permissions, setPermissions] = useState(0);

	// Refresh course on course update
	const [reloadCourse, setReloadCourse] = useState(0);
	const courseUpdate = (course: CoursePartial) => setReloadCourse(x => x + 1);

	// TODO: Only used as input to UserSettingsPermissions, probably change the structure for it
	useEffect(() => {
		coursePermission(courseId)
		.then((permission: Permission) => {
			setPermissions(permission.permissions);
		});
	}, []);

	// Roles to which you can set a user (excludes unregistered)
	const courseRoles = [courseRole.student, courseRole.teacher, courseRole.TA, courseRole.moduleCoordinator, courseRole.plugin];

	return (
		<Frame title="Course" sidebar search={{course: courseId}}>
			<Jumbotron>
				<Loading<Course>
					loader={(courseId, reloadCourse) => getCourse(courseId)}
					params={[courseId, reloadCourse]}
					component={course => <Fragment><h1>{course.name}</h1><p>Created by {course.creator.name}</p></Fragment>}
				/>
			</Jumbotron>
			<Permissions required={PermissionEnum.manageCourses}>
				<DataList header="Course Settings">
					<CourseSettingsGeneral courseID={courseId} handleResponse={courseUpdate}/>
				</DataList>
			</Permissions>
			<Permissions required={PermissionEnum.manageUserRegistration}>
				<DataList header="Course Invites">
					<CourseSettingsInvites courseID={courseId}/>
				</DataList>
			</Permissions>
			<Permissions required={PermissionEnum.manageUserRegistration}>
				<DataList header="Enroll a User">
					<CourseSettingsEnrollment courseID={courseId}/>
				</DataList>
			</Permissions>
			<Permissions required={PermissionEnum.manageUserRole}>
				<DataList header="User Roles">
					<UserSettingsRoles<typeof courseRole> roles={courseRole} courseID={courseId}/>
				</DataList>
			</Permissions>
			<Permissions required={[PermissionEnum.manageUserPermissionsView, PermissionEnum.manageUserPermissionsManager]}>
				<DataList header="User Permissions">
					<UserSettingsPermissions
						courseID={courseId}
						viewPermissions={containsPermission(PermissionEnum.manageUserPermissionsView, permissions)}
						managePermissions={containsPermission(PermissionEnum.manageUserPermissionsManager, permissions)}
					/>
				</DataList>
			</Permissions>
		</Frame>
	);
}