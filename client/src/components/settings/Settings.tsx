import * as React from 'react';
import {useEffect, useState} from 'react';
import {Button, Jumbotron} from "react-bootstrap";
import {Frame} from "../frame/Frame";
import {UserSettings} from "./UserSettings";
import {PermissionSettings} from "./PermissionSettings";
import {getCurrentUser, permission} from "../../../helpers/APIHelper";
import {User} from "../../../../models/api/User";
import {containsPermission, PermissionEnum} from "../../../../models/enums/permissionEnum";
import {DataList} from "../data/DataList";
import {PluginSettings} from './PluginSettings';
import {Loading} from '../general/loading/Loading';
import {Permission} from '../../../../models/api/Permission';
import {RoleSettings} from "./RoleSettings";
import {globalRole} from "../../../../models/enums/globalRoleEnum";

export function Settings() {
    const [permissions, setPermissions] = useState(0);

    // Roles user can set globally with permission (not unregistered)
    const globalRoles = [globalRole.plugin, globalRole.user, globalRole.staff, globalRole.admin];

    useEffect(() => {
        getCurrentUser()
            .then((user : User) => {
                setPermissions(user.permission.permissions);
            });
    }, []);

    return (
        <Frame title="Settings" sidebar search>
            <Jumbotron>
                <h1>Settings</h1>
                <Button>Have a button!</Button>
            </Jumbotron>

            <DataList header="User Details" children = {<UserSettings />} />

            {
                (
                    containsPermission(PermissionEnum.manageUserPermissionsManager, permissions) ||
                    containsPermission(PermissionEnum.manageUserPermissionsView, permissions)
                ) &&
                <DataList
                    header="User Permission Settings"
                    children={
                        <PermissionSettings
                            viewPermissions={containsPermission(PermissionEnum.manageUserPermissionsView, permissions)}
                            managePermissions={containsPermission(PermissionEnum.manageUserPermissionsManager, permissions)}
                        />
                    }
                />
            }

            {
                containsPermission(PermissionEnum.manageUserRole, permissions) &&
                <DataList
                    header={"User Role Settings"}
                    children={ <RoleSettings global = {{ roles : globalRoles }}/> }
                />
            }

            <Loading<Permission>
                loader={permission}
                component={permission => 
                    containsPermission(PermissionEnum.managePlugins, permission.permissions)
                    ? <DataList header="Plugins"><PluginSettings /></DataList> 
                    : []
                } />
        </Frame>
    )
}
