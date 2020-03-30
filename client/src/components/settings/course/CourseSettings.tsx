import React, {Fragment, useEffect, useState} from "react";
import {Frame} from "../../frame/Frame";
import {Loading} from "../../general/loading/Loading";
import {coursePermission, getCourse} from "../../../../helpers/APIHelper";
import {Jumbotron} from "react-bootstrap";
import {Course, CoursePartial} from "../../../../../models/api/Course";
import {Permission} from "../../../../../models/api/Permission";
import {containsPermission, PermissionEnum} from "../../../../../models/enums/permissionEnum";
import {CourseSettingsGeneral} from "./CourseSettingsGeneral";
import {DataList} from "../../data/DataList";
import {CourseSettingsEnrollment} from "./CourseSettingsEnrollment";
import {UserSettingsRoles} from "../user/UserSettingsRoles";
import {courseRole} from "../../../../../models/enums/courseRoleEnum";
import {CourseSettingsInvites} from "./CourseSettingsInvites";
import {UserSettingsPermissions} from "../user/UserSettingsPermissions";

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
			{
				containsPermission(PermissionEnum.manageCourses, permissions) &&
				<DataList header="Course settings">
					<CourseSettingsGeneral courseID={courseId} handleResponse={courseUpdate}/>
				</DataList>
			}
			{
				containsPermission(PermissionEnum.manageUserRegistration, permissions) &&
				<DataList header="Course invites">
					<CourseSettingsInvites courseID={courseId}/>
				</DataList>
			}
			{
				containsPermission(PermissionEnum.manageUserRegistration, permissions) &&
				<DataList header="Enroll a user">
					<CourseSettingsEnrollment courseID={courseId}/>
				</DataList>
			}
			{
				containsPermission(PermissionEnum.manageUserRole, permissions) &&
				<DataList header="User Roles">
					<UserSettingsRoles<typeof courseRole> roles={courseRole} courseID={courseId}/>
				</DataList>
			}
			{
				containsPermission(PermissionEnum.manageUserPermissionsManager, permissions) &&
				<DataList header="User Permissions">
					<UserSettingsPermissions
						courseID={courseId}
						viewPermissions={containsPermission(PermissionEnum.manageUserPermissionsView, permissions)}
						managePermissions={containsPermission(PermissionEnum.manageUserPermissionsManager, permissions)}
					/>
				</DataList>
			}
		</Frame>
	);
}