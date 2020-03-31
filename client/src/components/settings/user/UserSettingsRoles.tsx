import React, {Fragment, useState} from "react";
import {Button, Form} from "react-bootstrap";
import {globalRole} from "../../../../../models/enums/globalRoleEnum";
import {courseRole} from "../../../../../models/enums/courseRoleEnum";
import {User} from "../../../../../models/api/User";
import {UserSearch} from "./UserSearch";
import {updateCourseRole, updateGlobalRole} from "../../../../helpers/APIHelper";
import {CourseUser} from "../../../../../models/api/CourseUser";
import {UserInfo} from "./UserInfo";
import {UserRoles} from "./UserRoles";

interface UserSettingsRolesProperties<T> {
	roles: T,
	courseID?: string
}

export function UserSettingsRoles<T>({roles, courseID}: UserSettingsRolesProperties<T>) {
	const [user, setUser] = useState(undefined as User | undefined);
	const [role, setRole] = useState(undefined as T | undefined);

	const handleUpdate = () => {
	    if (user && role) {
            if (courseID) {
                updateCourseRole(user.ID, courseID, role as unknown as courseRole)
                .then((user: CourseUser) => {
                    console.log("Updated role in course");
                    console.log(user);
                    setUser(undefined);
                    setRole(undefined);
                    // TODO: Visual feedback
                });
            } else {
                updateGlobalRole(user.ID, role as unknown as globalRole)
                .then((user: User) => {
                    console.log("Updated global role");
                    console.log(user);
                    setUser(undefined);
                    setRole(undefined);
                    // TODO: Visual feedback
                });
            }
        }
    };

	return <Form>
		<UserSearch courseID={courseID} onSelected={setUser}/>
		{
			user &&
			<Fragment>
				<UserInfo user={user}/>
				<UserRoles<T> roles={roles} onSelected={setRole}/>
				<Button onClick={handleUpdate}>Update Role</Button>
			</Fragment>
		}
	</Form>
}