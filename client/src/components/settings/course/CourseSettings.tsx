import React, {Fragment} from "react";
import {Jumbotron} from "react-bootstrap";
import {CourseRole} from "../../../../../models/enums/CourseRoleEnum";
import {PermissionEnum} from "../../../../../models/enums/PermissionEnum";
import {DataList} from "../../data/DataList";
import {Frame} from "../../frame/Frame";
import {Permissions} from "../../general/Permissions";
import {UserSettingsRoles} from "../user/UserSettingsRoles";
import {CourseSettingsEnrollment} from "./CourseSettingsEnrollment";
import {CourseSettingsInvites} from "./CourseSettingsInvites";
import {UserSettingsPermissions} from "../user/UserSettingsPermissions";
import {CourseSettingsGeneral} from "./CourseSettingsGeneral";
import {CourseSettingsDisenrollment} from "./CourseSettingsDisenrollment";
import {useCourse} from "../../../helpers/api/APIHooks";
import {Cached} from "../../general/loading/Cached";
import {CourseSettingsDelete} from "./CourseSettingsDelete";

interface CourseOverviewProps {
    match: {
        params: {
            courseId: string
        }
    }
}

export function CourseSettings({match: {params: {courseId}}}: CourseOverviewProps) {
    const course = useCourse(courseId);

    return (
        <Frame title="Course" sidebar search={{course: courseId}}>
            <Jumbotron>
                <Cached cache={course}>
                    {course => <Fragment><h1>{course.name}</h1><p>Created by {course.creator.name}</p></Fragment>}
                </Cached>
            </Jumbotron>
            <Permissions single={PermissionEnum.manageCourses} course={courseId}>
                <DataList header="Course Settings">
                    <CourseSettingsGeneral courseID={courseId}/>
                </DataList>
            </Permissions>
            <Permissions single={PermissionEnum.manageUserRegistration} course={courseId}>
                <DataList header="Course Invites">
                    <CourseSettingsInvites courseID={courseId}/>
                </DataList>
            </Permissions>
            <Permissions single={PermissionEnum.manageUserRegistration} course={courseId}>
                <DataList header="Enroll a User">
                    <CourseSettingsEnrollment courseID={courseId}/>
                </DataList>
            </Permissions>
            <Permissions single={PermissionEnum.manageUserRegistration} course={courseId}>
                <DataList header="Disenroll a User">
                    <CourseSettingsDisenrollment courseID={courseId}/>
                </DataList>
            </Permissions>
            <Permissions single={PermissionEnum.manageUserRole} course={courseId}>
                <DataList header="User Roles">
                    <UserSettingsRoles<typeof CourseRole> roles={CourseRole} courseID={courseId}/>
                </DataList>
            </Permissions>
            <Permissions any={[PermissionEnum.manageUserPermissionsView, PermissionEnum.manageUserPermissionsManager]} course={courseId}>
                <DataList header="User Permissions">
                    <UserSettingsPermissions courseID={courseId}/>
                </DataList>
            </Permissions>
            <Permissions single={PermissionEnum.manageCourses} course={courseId}>
                <DataList header="Delete Course">
                    <CourseSettingsDelete courseID={courseId}/>
                </DataList>
            </Permissions>
        </Frame>
    );
}