import React, { Fragment } from 'react';
import { PermissionEnum, containsPermission } from '../../../../models/enums/permissionEnum';
import { usePermission } from '../../helpers/api/API';

interface PermissionProperties {
    required: PermissionEnum | PermissionEnum[],
    children: React.ReactNode,
    error?: React.ReactNode
}

/** Only shows its children if the current user has one of the required permissions */
export function Permissions({ required, children, error }: PermissionProperties) {
    const {permission, refreshPermission} = usePermission();

    const requiredPermission = required instanceof Array ? required : [required];

    if (permission.state === "Loaded" && requiredPermission.some(req => containsPermission(req, permission.item.permissions))) {
        return <Fragment>{children}</Fragment>;
    } else if (permission.state === "Loaded" && error) {
        return <Fragment>{error}</Fragment>;
    } else {
        return <Fragment />;
    }
}