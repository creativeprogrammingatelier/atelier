import React, { Fragment, useMemo } from 'react';
import {ParentalProperties} from "../../helpers/ParentHelper";
import {Cached} from './loading/Cached';
import {usePermission} from '../../helpers/api/APIHooks';
import {PermissionEnum, containsPermissionAny, containsPermission, containsPermissionAll} from "../../../../models/enums/permissionEnum";

interface GenericPermissionsProperties extends ParentalProperties {
    /** Optional error to display if the user doesn't have the required permissions */
    error?: React.ReactNode
}

interface SinglePermissionsProperties extends GenericPermissionsProperties {
    /** A single permission is required */
    single: PermissionEnum
}

interface AnyPermissionsProperties extends GenericPermissionsProperties {
    /** One of the listed permissions is required */
    any: PermissionEnum[]
}

interface AllPermissionsProperties extends GenericPermissionsProperties {
    /** All of the listed permissions are required */
    all: PermissionEnum[]
}

type PermissionsProperties = 
    | SinglePermissionsProperties
    | AllPermissionsProperties
    | AnyPermissionsProperties

/**
 * Only shows its children if the current user has the required permissions. You can use
 * either the `single`, `any` or `all` attribute to indicate that the user needs to have
 * respectively that single permission, any of the listed permissions or all of the listed
 * permissions.
 */
export function Permissions({ children, error, ...props }: PermissionsProperties) {
    const permission = usePermission();

    const permissionCheck = useMemo(() => {
        if ("single" in props) {
            return (permissions: number) => containsPermission(props.single, permissions);
        } else if ("any" in props) {
            return (permissions: number) => containsPermissionAny(props.any, permissions);
        } else {
            return (permissions: number) => containsPermissionAll(props.all, permissions);
        }
    }, [props]);

    return (
        <Cached cache={permission} wrapper={_ => <Fragment />}>{
            permission => {
                if (permissionCheck(permission.permissions)) {
                    return <Fragment children={children} />
                } else if (error) {
                    return <Fragment children={error} />
                } else {
                    return <Fragment />;
                }
            }
        }</Cached>
    );
}