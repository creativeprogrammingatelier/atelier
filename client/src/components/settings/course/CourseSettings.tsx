import React, {Fragment, useState} from "react";
import {Jumbotron} from "react-bootstrap";
import {Course, CoursePartial} from "../../../../../models/api/Course";
import {CourseRole} from "../../../../../models/enums/CourseRoleEnum";
import {PermissionEnum} from "../../../../../models/enums/PermissionEnum";
import {getCourse} from "../../../../helpers/APIHelper";
import {DataList} from "../../data/DataList";
import {Frame} from "../../frame/Frame";
import {Loading} from "../../general/loading/Loading";
import {Permissions} from "../../general/Permissions";
import {UserSettingsRoles} from "../user/UserSettingsRoles";
import {CourseSettingsEnrollment} from "./CourseSettingsEnrollment";
import {CourseSettingsInvites} from "./CourseSettingsInvites";
import {UserSettingsPermissions} from "../user/UserSettingsPermissions";
import {CourseSettingsGeneral} from "./CourseSettingsGeneral";
import {CourseSettingsDisenrollment} from "./CourseSettingsDisenrollment";

interface CourseOverviewProps {
	match: {
		params: {
			courseId: string
		}
	}
}

export function CourseSettings({match: {params: {courseId}}}: CourseOverviewProps) {
	// Refresh course on course update
	const [reloadCourse, setReloadCourse] = useState(0);
	const courseUpdate = (course: CoursePartial) => setReloadCourse(x => x + 1);

	return (
		<Frame title="Course" sidebar search={{course: courseId}}>
			<Jumbotron>
				<Loading<Course>
					loader={(courseId, reloadCourse) => getCourse(courseId)}
					params={[courseId, reloadCourse]}
					component={course => <Fragment><h1>{course.name}</h1><p>Created by {course.creator.name}</p></Fragment>}
				/>
			</Jumbotron>
			<Permissions single={PermissionEnum.manageCourses}>
				<Loading<Course>
					loader={courseId => getCourse(courseId)}
					params={[courseId]}
					component={course =>
						<DataList header="Course Settings">
							<CourseSettingsGeneral course={course}/>
						</DataList>
					}
				/>
			</Permissions>
			<Permissions single={PermissionEnum.manageUserRegistration}>
				<DataList header="Course Invites">
					<CourseSettingsInvites courseID={courseId}/>
				</DataList>
			</Permissions>
			<Permissions single={PermissionEnum.manageUserRegistration}>
				<DataList header="Enroll a User">
					<CourseSettingsEnrollment courseID={courseId}/>
				</DataList>
			</Permissions>
			<Permissions single={PermissionEnum.manageUserRegistration}>
				<DataList header="Disenroll a User">
					<CourseSettingsDisenrollment courseID={courseId}/>
				</DataList>
			</Permissions>
			<Permissions single={PermissionEnum.manageUserRole}>
				<DataList header="User Roles">
					<UserSettingsRoles<typeof CourseRole> roles={CourseRole} courseID={courseId}/>
				</DataList>
			</Permissions>
			<Permissions any={[PermissionEnum.manageUserPermissionsView, PermissionEnum.manageUserPermissionsManager]}>
				<DataList header="User Permissions">
					<UserSettingsPermissions courseID={courseId}/>
				</DataList>
			</Permissions>
		</Frame>
	);
}