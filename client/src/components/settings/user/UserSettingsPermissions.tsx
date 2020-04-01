import React, {useState, Fragment, useEffect} from "react";
import {Button, Form} from "react-bootstrap";
import {CourseUser} from "../../../../../models/api/CourseUser";
import {User} from "../../../../../models/api/User";
import {getEnum} from "../../../../../models/enums/EnumHelper";
import {PermissionEnum, containsPermission, permissionsSectionView, permissionsSectionManage} from "../../../../../models/enums/PermissionEnum";
import {setPermissionCourse, setPermissionGlobal} from "../../../../helpers/APIHelper";
import {Area} from "../../general/Area";
import {CheckboxInput} from "../../input/CheckboxInput";
import {LabeledInput} from "../../input/LabeledInput";
import {UserInfo} from "./UserInfo";
import {UserSearch} from "./UserSearch";

interface PermissionDisplay {
	[key: string]: string
}
interface PermissionState {
	[key: string]: boolean
}
interface UserSettingsPermissionsProperties {
	viewPermissions: boolean,
	managePermissions: boolean
	courseID?: string,
}
interface UserSettingsPermissionsSectionProperties {
	header: string,
	display: PermissionDisplay,
	state: PermissionState,
	setState: (permission: string, state: boolean) => void
}

export function UserSettingsPermissions({viewPermissions, managePermissions, courseID}: UserSettingsPermissionsProperties) {
	const [user, setUser] = useState(undefined as User | undefined);
	const [permissions, setPermissions] = useState({} as PermissionState);

	const setPermission = (permission: string, state: boolean) => {
		setPermissions(permissions => ({...permissions, [permission]: state}));
	};
	const handleUpdate = () => {
		if (user) {
			// Send local / global permission request
			if (courseID) {
				console.log("Local permissions");
				setPermissionCourse(courseID, user.ID, permissions).then((courseUser: CourseUser) => {
					console.log("Success");
					console.log(courseUser);
					// TODO handle response
				});
			} else {
				console.log("Global permissions");
				setPermissionGlobal(user.ID, permissions).then((courseUser: CourseUser) => {
					console.log("Success");
					console.log(courseUser);
					// TODO handle response
				});
			}
		}
	};

	useEffect(() => {
		Object.keys({...permissionsSectionView, ...permissionsSectionManage}).map(permission => {
			setPermission(permission, user ? containsPermission(getEnum(PermissionEnum, permission), user.permission.permissions) : false);
		});
	}, [user]);

	return <Form>
		<UserSearch courseID={courseID} onSelected={setUser}/>
		{
			user &&
			<Fragment>
				<UserInfo user={user}/>
				{viewPermissions && <UserSettingsPermissionsSection header="Viewing permissions" display={permissionsSectionView} state={permissions} setState={setPermission}/>}
				{managePermissions && <UserSettingsPermissionsSection header="Managing permissions" display={permissionsSectionManage} state={permissions} setState={setPermission}/>}
				<Button onClick={handleUpdate}>Update permissions</Button>
			</Fragment>
		}
	</Form>;
}
function UserSettingsPermissionsSection({header, display, state, setState}: UserSettingsPermissionsSectionProperties) {
	return <LabeledInput label={header}>
		<Area>
			{Object.entries(display).map(([name, display]: [string, string]) =>
				<CheckboxInput value={name} name={display} selected={state[name]} onChange={(state) => setState(name, state)}/>
			)}
		</Area>
	</LabeledInput>;
}