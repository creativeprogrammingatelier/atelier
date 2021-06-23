import React from 'react';
import {Jumbotron} from 'react-bootstrap';

import {GlobalRole} from '../../../../../models/enums/GlobalRoleEnum';
import {PermissionEnum} from '../../../../../models/enums/PermissionEnum';

import {DataList} from '../../data/DataList';
import {Frame} from '../../frame/Frame';
import {Permissions} from '../../general/Permissions';
import {UserSettingsRoles} from '../user/UserSettingsRoles';
import {UserSettingsPermissions} from '../user/UserSettingsPermissions';
import {PluginSettings} from './PluginSettings';
import {CourseCreator} from './CourseCreator';

/**
 * Component for managing Atelier settings.
 */
export function SystemSettings() {
  return <Frame title="Settings" sidebar search>
    <Jumbotron>
      <h1>Atelier System Settings</h1>
      <p>Manage the Atelier platform here</p>
    </Jumbotron>
    <Permissions single={PermissionEnum.addCourses}>
      <DataList header="Create a New Course">
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
        <UserSettingsPermissions/>
      </DataList>
    </Permissions>
    <Permissions single={PermissionEnum.managePlugins}>
      <DataList header="Plugins">
        <PluginSettings/>
      </DataList>
    </Permissions>
  </Frame>;
}
