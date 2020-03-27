import React, {Fragment, useEffect, useState} from "react";
import {Frame} from "../../frame/Frame";
import {Loading} from "../../general/loading/Loading";
import {coursePermission, getCourse} from "../../../../helpers/APIHelper";
import {Jumbotron} from "react-bootstrap";
import {Course, CoursePartial} from "../../../../../models/api/Course";
import {Permission} from "../../../../../models/api/Permission";
import {containsPermission, PermissionEnum} from "../../../../../models/enums/permissionEnum";
import {PermissionSettings} from "../PermissionSettings";
import {CourseSettingsGeneral} from "./CourseSettingsGeneral";
import {DataList} from "../../data/DataList";
import {CourseRegistration} from "../../course/CourseRegistration";
import {RoleSettings} from "../RoleSettings";
import {courseRole} from "../../../../../models/enums/courseRoleEnum";
import {CourseSettingsInvites} from "./CourseSettingsInvites";

interface CourseOverviewProps {
	match: {
		params: {
			courseId: string
		}
	}
}

export function CourseSettings({match}: CourseOverviewProps) {
	const [reload, updateReload] = useState(0);
	const [permissions, setPermissions] = useState(0);

	// Refresh course on course update
	const [reloadCourse, setReloadCourse] = useState(0);
	const courseUpdate = (course: CoursePartial) => setReloadCourse(x => x + 1);

	useEffect(() => {
		coursePermission(match.params.courseId, true)
		.then((permission: Permission) => {
			setPermissions(permission.permissions);
		});
	}, []);

	// Roles to which you can set a user (excludes unregistered)
	const courseRoles = [courseRole.student, courseRole.teacher, courseRole.TA, courseRole.moduleCoordinator, courseRole.plugin];

	return (
		<Frame title="Course" sidebar search={{course: match.params.courseId}}>
			<Jumbotron>
				<Loading<Course>
					loader={(courseId, reloadCourse) => getCourse(courseId, false)}
					params={[match.params.courseId, reloadCourse]}
					component={course => <Fragment><h1>{course.name}</h1><p>Created by {course.creator.name}</p></Fragment>}
				/>
			</Jumbotron>
			{
				containsPermission(PermissionEnum.manageCourses, permissions) &&
				<DataList header="Course settings">
					<CourseSettingsGeneral courseID={match.params.courseId} handleResponse={courseUpdate}/>
				</DataList>
			}
			{
				containsPermission(PermissionEnum.manageUserRegistration, permissions) &&
				<DataList header="Course invites">
					<CourseSettingsInvites courseID={match.params.courseId}/>
				</DataList>
			}
			{
				containsPermission(PermissionEnum.manageUserRegistration, permissions) &&
				<DataList header="Enroll a user">
					<CourseRegistration courseID={match.params.courseId}/>
				</DataList>
			}
			{containsPermission(PermissionEnum.manageUserRole, permissions) &&
			<DataList
				header={"User Roles"}
				children={
					<RoleSettings course={{
						roles: courseRoles,
						courseID: match.params.courseId
					}}/>
				}
			/>
			}
			{containsPermission(PermissionEnum.manageUserPermissionsManager, permissions) &&
			<DataList
				header="User Permissions"
				children={
					<PermissionSettings
						courseID={match.params.courseId}
						viewPermissions={containsPermission(PermissionEnum.manageUserPermissionsView, permissions)}
						managePermissions={containsPermission(PermissionEnum.manageUserPermissionsManager, permissions)}
					/>
				}
			/>
			}
		</Frame>
	);
}