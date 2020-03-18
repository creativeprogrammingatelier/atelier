import React, {Fragment, useEffect, useState} from "react";
import {Frame} from "../frame/Frame";
import {DataBlockList} from "../general/data/DataBlockList";
import {Loading} from "../general/loading/Loading";
import {Submission} from "../../../../models/api/Submission";
import {coursePermission, getCourse, getCourseMentions, getCourseSubmissions} from "../../../helpers/APIHelper";
import {Uploader} from "../uploader/Uploader";
import {Jumbotron} from "react-bootstrap";
import {Course, CoursePartial} from "../../../../models/api/Course";
import {Mention} from "../../../../models/api/Mention";
import {CourseInvites} from "../invite/CourseInvite";
import {Permission} from "../../../../models/api/Permission";
import {containsPermission, PermissionEnum} from "../../../../models/enums/permissionEnum";
import {PermissionSettings} from "../settings/PermissionSettings";
import {DataList} from "../general/data/DataList";
import {UpdateCourse} from "../settings/Course/UpdateCourse";

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
                        <PermissionSettings courseID={match.params.courseId}/>
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
        </Frame>
    );
}