import React from 'react';
import {useState} from "react";
import {Loading} from "../general/loading/Loading";
import {getCourses, setCommentThreadVisibility, setPermission} from "../../../helpers/APIHelper";
import {CoursePartial} from "../../../../models/api/Course";
import {Permissions} from "../../../../models/api/Permission";
import {PermissionEnum} from "../../../../models/enums/permissionEnum";

export function CourseSettings() {
    const [settingsCourse, setSettingsCourse] = useState("");
    const [settingsUser, setSettingsUser] = useState("");
    const [settingsPermission, setSettingsPermission] = useState("");

    const setPermissions = () => {
        console.log(settingsCourse);
        console.log(settingsUser);
        console.log(settingsPermission);
        //setPermission(settingsCourse, settingsUser, {permissions : {viewAllCourses : true}})

    };
    // TODO show courses in which you can manage user permissions

    return (
        <Loading<CoursePartial[]>
            loader={getCourses}
            component={(courses : CoursePartial[]) => {
                return (
                    <div>
                        <select
                            value={settingsCourse}
                            onChange={(e) => setSettingsCourse(e.target.value)}
                        >
                            { courses.map((course : CoursePartial) => <option value={course.ID}>{course.name}</option>) }
                        </select>
                        <input
                            type='text'
                            value={settingsUser}
                            onChange={(e) => setSettingsUser(e.target.value)}
                        />
                        <input
                            type='text'
                            value={settingsPermission}
                            onChange={(e) => setSettingsPermission(e.target.value)}
                        />
                        <button onClick={setPermissions}>Set permissions</button>
                    </div>
                )
            }} />
    )
}