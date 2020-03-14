import * as React from 'react';
import {Loading} from "../general/loading/Loading";
import {getCourses, getCurrentUser, getUser, setUser} from "../../../helpers/APIHelper";
import {User} from "../../../../models/api/User";
import {useState} from "react";
import {InputField} from "../general/InputField";

export function UserSettings() {
    const [reload, setReload] = useState(false);
    // if view all courses => get all courses

    // view courses with manageUserPermissionsManager
    // view courses with manageUserRole

    return (
        <div></div>
    )
}