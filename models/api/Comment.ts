import {User} from "./User";
import {ThreadState} from "../enums/ThreadStateEnum";

export interface Comment {
    ID: string,
    user: User,
    text: string,
    created: string,
    edited: string,
    thread: {
        visibility: ThreadState,
        automated: boolean
    },
    submission: {
        name: string,
        user: {
            ID: string,
            userName: string
        }
    },
    references: {
        courseID: string,
        submissionID: string,
        commentThreadID: string,
        fileID?: string,
        snippetID?: string,
    }
}
