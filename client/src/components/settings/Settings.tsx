import * as React from 'react';
import {useEffect, useState} from 'react';
import {Button, Jumbotron} from "react-bootstrap";
import {Frame} from "../frame/Frame";
import {UserSettings} from "./UserSettings";
import {PermissionSettings} from "./PermissionSettings";
import {getCurrentUser} from "../../../helpers/APIHelper";
import {User} from "../../../../models/api/User";
import {containsPermission, PermissionEnum} from "../../../../models/enums/permissionEnum";
import {DataList} from "../data/DataList";
import { PluginSettings } from './PluginSettings';
import { Loading } from '../general/loading/Loading';
import { permission } from '../../../helpers/APIHelper';
import { Permission } from '../../../../models/api/Permission';

export function Settings() {
    const [permissions, setPermissions] = useState(0);
    useEffect(() => {
        getCurrentUser(true)
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
