export enum PermissionEnum {
    'admin',
    'manageUserPermissionsView',
    'manageUserPermissionsManager',
    'manageUserRole',
    'managePlugins',
    '5-reserved',
    'viewAllUserProfiles',
    'manageUserRegistration',
    '8-reserved',
    '9-reserved',
    '10-reserved',
    'viewAllCourses',
    'addCourses',
    'manageCourses',
    '14-reserved',
    '15-reserved',
    '16-reserved',
    'addAssignments',
    'manageAssignments',
    '19-reserved',
    '20-reserved',
    '21-reserved',
    'viewAllSubmissions',
    '23-reserved',
    '24-reserved',
    '25-reserved',
    'viewRestrictedComments',
    'addRestrictedComments',
    'manageRestrictedComments',
    '29-reserved',
    '30-reserved',
    '31-reserved',
    'mentionAllStudents',
    'mentionAllAssistants',
    'mentionAllTeachers',
    'mentionNoLimit',
    '36-reserved',
    '37-reserved',
    '38-reserved',
    '39-reserved'
}

export const viewPermissionBits = 71305280;
export const managePermissionBits = 64827568286;

export const viewPermissions = [
    {
        display: 'View all user profiles',
        name: 'viewAllUserProfiles'
    },
    {
        display: 'View all courses',
        name: 'viewAllCourses'
    },
    {
        display: 'View all submissions',
        name: 'viewAllSubmissions'
    },
    {
        display: 'View restricted comments',
        name: 'viewRestrictedComments'
    }
];
export const managePermissions = [
    {
        display: 'Manage user permissions view',
        name: 'manageUserPermissionsView'
    },
    {
        display: 'Manage user permissions manager',
        name: 'manageUserPermissionsManager'
    },
    {
        display: 'Manage user role',
        name: 'manageUserRole'
    },
    {
        display : 'Manage plugins',
        name : 'managePlugins'
    },
    {
        display: 'Manage user registration',
        name: 'manageUserRegistration'
    },
    {
        display: 'Add courses',
        name: 'addCourses'
    },
    {
        display: 'Manage courses',
        name: 'manageCourses'
    }, {
        display: 'Add assignments - not used',
        name: 'addAssignments'
    }
    , {
        display: 'Manage Assignments',
        name: 'manageAssignments'
    },
    {
        display: 'Add restricted comments',
        name: 'addRestrictedComments'
    },
    {
        display: 'Manage restricted comments',
        name: 'manageRestrictedComments'
    },
    {
        display: 'Mention all students',
        name: 'mentionAllStudents'
    },
    {
        display: 'Mention all assistants',
        name: 'mentionAllAssistants'
    },
    {
        display: 'Mention all teachers',
        name: 'mentionAllTeachers'
    },
    {
        display: 'No mention limit',
        name: 'mentionNoLimit'
    }
];

export const permissionsSectionView: {[key: string]: string} = {
    viewAllUserProfiles: "View all user profiles",
    viewAllCourses: "View all courses",
    viewAllSubmissions: "View all submissions",
    viewRestrictedComments: "View restricted comments"
};
export const permissionsSectionManage: {[key: string]: string} = {
    manageUserPermissionsView: "Manage user permissions view",
    manageUserPermissionsManager: "Manage user permissions manager",
    manageUserRole: "Manage user role",
    managePlugins : "Manage plugins",
    manageUserRegistration: "Manage user registration",
    addCourses: "Add courses",
    manageCourses: "Manage courses",
    addAssignments: "Add assignments (Unused)",
    manageAssignments: "Manage Assignments (Unused)",
    addRestrictedComments: "Add restricted comments",
    manageRestrictedComments: "Manage restricted comments",
    mentionAllStudents: "Mention all students",
    mentionAllAssistants: "Mention all assistants",
    mentionAllTeachers: "Mention all teachers",
    mentionNoLimit: "No mention limit",
};

/**
 * Checks whether the user has a certain permission. Has to use BigInt as javascript does not support
 * big operation on numbers with more than 32 bits, even though numbers can obtain higher values in
 * javascript.
 * @param permission, permission to check
 * @param permissions, permissions of the user
 */
export function containsPermission(permission: PermissionEnum, permissions: number) {
    const permissionsBigInt = BigInt(permissions);
    const permissionBit = BigInt(1) << BigInt(permission);
    return (permissionBit & permissionsBigInt) > BigInt(0);
}
export function containsPermissionAny(permission: PermissionEnum[], permissions: number) {
    return permission.some((element) => containsPermission(element, permissions));
}
export function containsPermissionAll(permission: PermissionEnum[], permissions: number) {
    return permission.every((element) => containsPermission(element, permissions));
}