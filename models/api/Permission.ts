export interface Permission {
    globalRole: string,
    courseRole?: string,
    permissions: number;
}

export interface CoursePermission {
    courseRole: string,
    permissions: number,
}

export interface Permissions extends Record<string, boolean | undefined> {
    admin?: boolean,
    manageUserPermissionsView?: boolean,
    manageUserPermissionsManager?: boolean,
    manageUserRole?: boolean,
    managePlugins?: boolean,
    viewAllUserProfiles?: boolean,
    manageUserRegistration?: boolean,
    viewAllCourses?: boolean,
    addCourses?: boolean,
    manageCourses?: boolean,
    addAssignments?: boolean,
    manageAssignments?: boolean,
    viewAllSubmissions?: boolean,
    viewRestrictedComments?: boolean,
    addRestrictedComments?: boolean,
    manageRestrictedComments?: boolean,
    mentionAllStudents?: boolean,
    mentionAllAssistants?: boolean,
    mentionAllTeachers?: boolean,
    mentionNoLimit?: boolean
}
