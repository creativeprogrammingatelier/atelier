import React, {Fragment, useEffect, useState} from "react";
import {Frame} from "../frame/Frame";
import {Loading} from "../general/loading/Loading";
import {coursePermission, getCourse} from "../../../helpers/APIHelper";
import {Jumbotron} from "react-bootstrap";
import {Course, CoursePartial} from "../../../../models/api/Course";
import {CourseInvites} from "../invite/CourseInvite";
import {Permission} from "../../../../models/api/Permission";
import {containsPermission, PermissionEnum} from "../../../../models/enums/permissionEnum";
import {PermissionSettings} from "../settings/PermissionSettings";
import {UpdateCourse} from "../settings/Course/UpdateCourse";
import {DataList} from "../data/DataList";
import {MentionSuggestions} from "../comment/MentionSuggestions";
import {UserSearch} from "../general/UserSearch";

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
            })
    }, []);

    return (
        <Frame title="Course" sidebar search={"/course/../search"}>
            <Jumbotron>
                <Loading<Course>
                    loader={(courseId, reloadCourse) => getCourse(courseId, false)}
                    params={[match.params.courseId, reloadCourse]}
                    component={course => <Fragment><h1>{course.name}</h1><p>Created by {course.creator.name}</p>
                    </Fragment>}
                />
            </Jumbotron>

            <CourseInvites courseID={match.params.courseId}/>

            {
                containsPermission(PermissionEnum.manageUserPermissionsManager, permissions) &&
                <DataList
                    header="User Permission Settings"
                    children={
                        <PermissionSettings
                            courseID={match.params.courseId}
                            viewPermissions={containsPermission(PermissionEnum.manageUserPermissionsView, permissions)}
                            managePermissions={containsPermission(PermissionEnum.manageUserPermissionsManager, permissions)}
                        />
                    }
                />
            }

            {
                containsPermission(PermissionEnum.manageCourses, permissions) &&
                <DataList
                    header={"Course settings"}
                    children={
                        <UpdateCourse courseID={match.params.courseId} handleResponse={courseUpdate}/>
                    }
                />
            }

            <UserSearch
                courseID={match.params.courseId}
                onSelected={(x : string) => console.log(x)}
            />
        </Frame>
    );
}