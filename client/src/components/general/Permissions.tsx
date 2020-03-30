import React, { Fragment } from 'react';
import {PermissionEnum, containsPermission, containsPermissionAny} from "../../../../models/enums/permissionEnum";
import { CacheState } from '../../helpers/api/Cache';
import { usePermission } from '../../helpers/api/APIHooks';
import {ParentalProperties} from "../../helpers/ParentHelper";

interface PermissionProperties extends ParentalProperties {
    required: PermissionEnum | PermissionEnum[],
    error?: React.ReactNode
}

/** Only shows its children if the current user has one of the required permissions */
export function Permissions({ required, children, error }: PermissionProperties) {
    const {permission} = usePermission();

    const requiredPermission = required instanceof Array ? required : [required];

    if (permission.state === CacheState.Loaded && containsPermissionAny(requiredPermission, permission.item.permissions)) {
        return <Fragment>{children}</Fragment>;
    } else if (permission.state === CacheState.Loaded && error) {
        return <Fragment>{error}</Fragment>;
    } else {
        return <Fragment />;
    }
}