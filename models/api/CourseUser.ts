import {Permission} from "./Permission";
import { User } from "./User";

export interface CourseUser {
    userID: string,
    courseID: string,
    userName: string,
    email: string,
    permission: Permission,
    canvasrefresh: string
}

export function courseUserToUser(cu: CourseUser): User {
    return {
        ID: cu.userID,
        name: cu.userName,
        email: cu.email,
        permission: cu.permission,
        canvasrefresh: cu.canvasrefresh
    };
}
