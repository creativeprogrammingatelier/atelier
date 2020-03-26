import React, { Fragment } from 'react';
import { PermissionEnum, containsPermission } from '../../../../models/enums/permissionEnum';
import { usePermission } from '../../helpers/api/APIHooks';

interface PermissionProperties {
    required: PermissionEnum | PermissionEnum[],
    children: React.ReactNode,
    error?: React.ReactNode
}

/** Only shows its children if the current user has one of the required permissions */
export function Permissions({ required, children, error }: PermissionProperties) {
    const { permission: { permissions } } = usePermission();

    const requiredPermission = required instanceof Array ? required : [required];

    if (requiredPermission.some(req => containsPermission(req, permissions))) {
        return <Fragment>{children}</Fragment>;
    } else if (error) {
        return <Fragment>{error}</Fragment>;
    } else {
        return <Fragment />;
    }
}