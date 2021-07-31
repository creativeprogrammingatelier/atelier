import React, {Fragment} from "react";
import {Jumbotron} from "react-bootstrap";

import {CourseRole} from "../../../../../models/enums/CourseRoleEnum";
import {PermissionEnum} from "../../../../../models/enums/PermissionEnum";

import {useCourse} from "../../../helpers/api/APIHooks";

import {DataList} from "../../data/DataList";
import {Frame} from "../../frame/Frame";
import {Cached} from "../../general/loading/Cached";
import {Permissions} from "../../general/Permissions";
import {UserSettingsPermissions} from "../user/UserSettingsPermissions";
import {UserSettingsRoles} from "../user/UserSettingsRoles";
import {CourseSettingsDelete} from "./CourseSettingsDelete";
import {CourseSettingsDisenrollment} from "./CourseSettingsDisenrollment";
import {CourseSettingsEnrollment} from "./CourseSettingsEnrollment";
import {CourseSettingsInvites} from "./CourseSettingsInvites";
import {CourseSettingsGeneral} from "./CourseSettingsGeneral";
import { Breadcrumbs, Crumb } from "../../general/Breadcrumbs";

interface CourseSettingsProperties {
    match: {
        /** Parameters of course */
        params: {
            /** Id of the course in the database */
            courseId: string
        }
    }
}
/**
 * Component for managing settings of a given course, course given via courseID.
 */
export function CourseSettings({match: {params: {courseId}}}: CourseSettingsProperties) {
    const course = useCourse(courseId);

    return <Cached
        cache={course}
        wrapper={() =>
            <Frame title="Course" sidebar search={{course: courseId}}>
                <Settings courseID={courseId}/>
            </Frame>
        }
    >
        {course =>
            <Frame title={course.name} sidebar search={{course: courseId}}>
                <Jumbotron>
                    <Breadcrumbs>
                        <Crumb text={course.name} link={`/course/${courseId}`} />
                    </Breadcrumbs>
                    <h1>Course Settings</h1>
                </Jumbotron>
                <Settings courseID={courseId}/>
            </Frame>
        }
    </Cached>;
}

interface SettingsProperties {
    /** ID of course within database */
    courseID: string
}
/**
 * Course settings for the given course.
 */
function Settings({courseID}: SettingsProperties) {
    return <Fragment>
        <Permissions single={PermissionEnum.manageCourses} course={courseID}>
            <DataList header="Course Settings">
                <CourseSettingsGeneral courseID={courseID}/>
            </DataList>
        </Permissions>
        <Permissions single={PermissionEnum.manageUserRegistration} course={courseID}>
            <DataList header="Course Invites">
                <CourseSettingsInvites courseID={courseID}/>
            </DataList>
        </Permissions>
        <Permissions single={PermissionEnum.manageUserRegistration} course={courseID}>
            <DataList header="Enroll a User">
                <CourseSettingsEnrollment courseID={courseID}/>
            </DataList>
        </Permissions>
        <Permissions single={PermissionEnum.manageUserRegistration} course={courseID}>
            <DataList header="Disenroll a User">
                <CourseSettingsDisenrollment courseID={courseID}/>
            </DataList>
        </Permissions>
        <Permissions single={PermissionEnum.manageUserRole} course={courseID}>
            <DataList header="User Roles">
                <UserSettingsRoles<typeof CourseRole> roles={CourseRole} courseID={courseID}/>
            </DataList>
        </Permissions>
        <Permissions any={[PermissionEnum.manageUserPermissionsView, PermissionEnum.manageUserPermissionsManager]} course={courseID}>
            <DataList header="User Permissions">
                <UserSettingsPermissions courseID={courseID}/>
            </DataList>
        </Permissions>
        <Permissions single={PermissionEnum.manageCourses} course={courseID}>
            <DataList header="Delete Course">
                <CourseSettingsDelete courseID={courseID}/>
            </DataList>
        </Permissions>
    </Fragment>;
}
