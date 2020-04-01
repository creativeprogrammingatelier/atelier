import React, {useEffect, useState} from "react";
import {Button, Jumbotron} from "react-bootstrap";
import {User} from "../../../../../models/api/User";
import {GlobalRole} from "../../../../../models/enums/globalRoleEnum";
import {containsPermission, PermissionEnum} from "../../../../../models/enums/permissionEnum";
import {getCurrentUser} from "../../../../helpers/APIHelper";
import {Frame} from "../../frame/Frame";
import {DataList} from "../../data/DataList";
import {Permissions} from "../../general/Permissions";
import {UserSettingsRoles} from "../user/UserSettingsRoles";
import {UserSettingsPermissions} from "../user/UserSettingsPermissions";
import {PluginSettings} from "./PluginSettings";
import {CourseCreator} from "./CourseCreator";

export function SystemSettings() {
	const [permissions, setPermissions] = useState(0);

	// Roles user can set globally with permission (not unregistered)
	const globalRoles = [GlobalRole.plugin, GlobalRole.user, GlobalRole.staff, GlobalRole.admin];

	// TODO: Only used as input to UserSettingsPermissions, probably change the structure for it
	useEffect(() => {
		getCurrentUser()
		.then((user: User) => {
			setPermissions(user.permission.permissions);
		});
	}, []);

	return (
		<Frame title="Settings" sidebar search>
			<Jumbotron>
				<h1>Atelier System Settings</h1>
				<p>Manage the Atelier platform here</p>
			</Jumbotron>
			<Permissions single={PermissionEnum.addCourses}>
				<DataList header="Create a new course">
					<CourseCreator/>
				</DataList>
			</Permissions>
			<Permissions single={PermissionEnum.manageUserRole}>
				<DataList header="Global User Roles">
					<UserSettingsRoles<typeof GlobalRole> roles={GlobalRole}/>
				</DataList>
			</Permissions>
			<Permissions any={[PermissionEnum.manageUserPermissionsView, PermissionEnum.manageUserPermissionsManager]}>
				<DataList header="Global User Permissions">
					<UserSettingsPermissions
						viewPermissions={containsPermission(PermissionEnum.manageUserPermissionsView, permissions)}
						managePermissions={containsPermission(PermissionEnum.manageUserPermissionsManager, permissions)}
					/>
				</DataList>
			</Permissions>
			<Permissions single={PermissionEnum.managePlugins}>
				<DataList header="Plugins">
					<PluginSettings/>
				</DataList>
			</Permissions>
		</Frame>
	);
}
