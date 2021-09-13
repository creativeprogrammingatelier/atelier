import {CourseRole} from "../enums/CourseRoleEnum";

/** String if link exists, otherwise undefined */
export interface Invite {
    student: string | undefined,
    TA: string | undefined,
    teacher: string | undefined
}

export interface CourseInvite {
    inviteID: string,
    creatorID: string,
    courseID: string,
    type: string,
    joinRole: CourseRole,
}
