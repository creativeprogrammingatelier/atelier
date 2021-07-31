import React, {Fragment, useMemo} from "react";
import {ParentalProperties} from "../../helpers/ParentHelper";
import {Cached} from "./loading/Cached";
import {usePermission, useCoursePermission} from "../../helpers/api/APIHooks";
import {
    PermissionEnum,
    containsPermissionAny,
    containsPermission,
    containsPermissionAll
} from "../../../../models/enums/PermissionEnum";

interface GenericPermissionsProperties extends ParentalProperties {
	/** Optional error to display if the user doesn't have the required permissions */
	error?: React.ReactNode,
	/** Optional courseID to check against course permissions */
	course?: string
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

export type PermissionsProperties =
	| SinglePermissionsProperties
	| AllPermissionsProperties
	| AnyPermissionsProperties

/**
 * Only shows its children if the current user has the required permissions. You can use
 * either the `single`, `any` or `all` attribute to indicate that the user needs to have
 * respectively that single permission, any of the listed permissions or all of the listed
 * permissions.
 */
export function Permissions({course, children, error, ...props}: PermissionsProperties) {
    const permissionCheck = useMemo(() => {
        if ("single" in props) {
            return (permissions: number) => containsPermission(props.single, permissions);
        } else if ("any" in props) {
            return (permissions: number) => containsPermissionAny(props.any, permissions);
        } else {
            return (permissions: number) => containsPermissionAll(props.all, permissions);
        }
    }, [props]);
	
    const render = (permissions: number) => {
        if (permissionCheck(permissions)) {
            return <Fragment children={children}/>;
        } else if (error) {
            return <Fragment children={error}/>;
        } else {
            return <Fragment/>;
        }
    };
	
    if (course === undefined) {
        return <GlobalPermissions render={render}/>;
    } else {
        return <CoursePermissions course={course} render={render}/>;
    }
}

interface GlobalPermissionsProperties {
	render: (permissions: number) => React.ReactNode
}
function GlobalPermissions({render}: GlobalPermissionsProperties) {
    const permission = usePermission();
    return <Cached cache={permission} wrapper={() => <Fragment/>}>
        {permissions => render(permissions.permissions)}
    </Cached>;
}

interface CoursePermissionsProperties extends GlobalPermissionsProperties {
	course: string
}
function CoursePermissions({course, render}: CoursePermissionsProperties) {
    const permission = useCoursePermission(course);
    return <Cached cache={permission} wrapper={() => <Fragment/>}>
        {permissions => render(permissions.permissions)}
    </Cached>;
}