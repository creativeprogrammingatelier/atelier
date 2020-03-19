export enum PermissionEnum {
    'admin',
    'manageUserPermissionsView',
    'manageUserPermissionsManager',
    'manageUserRole',
    '4-reserved',
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

export function containsPermission(permission: PermissionEnum, permissions: number) {
    return ((1 << permission) & permissions) > 0;
}