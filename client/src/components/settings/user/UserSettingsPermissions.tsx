import React, {useState, Fragment, useEffect} from "react";
import {Button, Form} from "react-bootstrap";

import {CourseUser} from "../../../../../models/api/CourseUser";
import {User} from "../../../../../models/api/User";
import {PermissionEnum, containsPermission, permissionsSectionView, permissionsSectionManage} from "../../../../../models/enums/PermissionEnum";

import {setPermissionCourse, setPermissionGlobal} from "../../../helpers/api/APIHelper";
import {getEnum} from "../../../../../helpers/EnumHelper";

import {Area} from "../../general/Area";
import {Permissions} from "../../general/Permissions";
import {CheckboxInput} from "../../input/CheckboxInput";
import {LabeledInput} from "../../input/LabeledInput";
import {UserInfo} from "./UserInfo";
import {UserSearch} from "./UserSearch";

interface PermissionDisplay {
    /** Permissions of the user */
    [key: string]: string
}
interface PermissionState {
    /** State of the permission of the user, whether active or not */
    [key: string]: boolean
}
interface UserSettingsPermissionsProperties {
    /** Course ID within the database */
    courseID?: string
}
interface UserSettingsPermissionsSectionProperties {
    /** Label of permissions settings */
    header: string,
    /** Current user permissions */
    display: PermissionDisplay,
    /** State of user permissions */
    state: PermissionState,
    /** Function for setting the changing the state of a user permission */
    setState: (permission: string, state: boolean) => void
}
/**
 * Component managing the permission of a given user, in the specified course.
 */
export function UserSettingsPermissions({courseID}: UserSettingsPermissionsProperties) {
    const [user, setUser] = useState(undefined as User | undefined);
    const [permissions, setPermissions] = useState({} as PermissionState);

    /**
     * Sets the new permission given.
     */
    const setPermission = (permission: string, state: boolean) => {
        setPermissions(permissions => ({...permissions, [permission]: state}));
    };
    /**
     * Function to handle updates to the permissions of the user.
     */
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
                <Permissions course={courseID} single={PermissionEnum.manageUserPermissionsView}>
                    <UserSettingsPermissionsSection header="Viewing permissions" display={permissionsSectionView}
                        state={permissions} setState={setPermission}/>
                </Permissions>
                <Permissions course={courseID} single={PermissionEnum.manageUserPermissionsManager}>
                    <UserSettingsPermissionsSection header="Managing permissions" display={permissionsSectionManage}
                        state={permissions} setState={setPermission}/>
                </Permissions>
                <Button onClick={handleUpdate}>Update permissions</Button>
            </Fragment>
        }
    </Form>;
}

/**
 * Component for displaying and changing the permissions of a user. Permissions are changed
 * via a checkbox input for every permission in "display".
 */
function UserSettingsPermissionsSection({header, display, state, setState}: UserSettingsPermissionsSectionProperties) {
    return <LabeledInput label={header}>
        <Area className="ml-2">
            {Object.entries(display).map(([name, display]: [string, string]) =>
                <CheckboxInput
                    key={name}
                    value={name}
                    children={display}
                    selected={state[name]}
                    onChange={(state) => setState(name, state)}
                />
            )}
        </Area>
    </LabeledInput>;
}
