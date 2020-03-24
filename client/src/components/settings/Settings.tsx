import * as React from 'react';
import {Button, Jumbotron} from "react-bootstrap";
import {Frame} from "../frame/Frame";
import {UserSettings} from "./UserSettings";
import {CourseSettings} from "./CourseSettings";
import {DataList} from "../data/DataList";
import { PluginSettings } from './PluginSettings';
import { Loading } from '../general/loading/Loading';
import { permission } from '../../../helpers/APIHelper';
import { Permission } from '../../../../models/api/Permission';
import { PermissionEnum, containsPermission } from '../../../../models/enums/permissionEnum';

export function Settings() {
    return (
        <Frame title="Settings" sidebar search>
            <Jumbotron>
                <h1>Settings</h1>
                <Button>Have a button!</Button>
            </Jumbotron>

            <DataList header="User Details" children = {<UserSettings />} />
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
