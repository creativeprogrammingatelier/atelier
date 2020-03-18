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
    ['View all user profiles' , 'viewAllUserProfiles'],
    ['View all courses', 'viewAllCourses'],
    ['View all submissions', 'viewAllSubmissions'],
    ['View restricted comments', 'viewRestrictedComments']
];

export const managePermissions = [
    ['Manage user permissions view', 'manageUserPermissionsView'],
    ['Manage user permissions manager', 'manageUserPermissionsManager'],
    ['Manage user role', 'manageUserRole'],

    ['Manage user registration', 'manageUserRegistration'],

    ['Add courses', 'addCourses'],
    ['Manage courses', 'manageCourses'],

    ['Add assignments - not used', 'addAssignments'],
    ['Manage Assignments', 'manageAssignments'],

    ['Add restricted comments', 'addRestrictedComments'],
    ['Manage restricted comments', 'manageRestrictedComments'],

    ['Mention all students', 'mentionAllStudents'],
    ['Mention all assistants', 'mentionAllAssistants'],
    ['Mention all teachers', 'mentionAllTeachers'],
    ['No mention limit', 'mentionNoLimit']
];

export function containsPermission(permission : PermissionEnum, permissions : number) {
    return ((1 << permission) & permissions) > 0;
}