import {CommentThread} from "../../../models/api/CommentThread";
import {Comment} from "../../../models/api/Comment";
import {createFileCommentThread, createSubmissionCommentThread} from "../../helpers/APIHelper";
import {threadState} from "../../../models/enums/threadStateEnum";
import {JsonFetchError} from "../../helpers/FetchHelper";
import {Selection} from "../../../models/api/Snippet";

export function commentThreadOwner(commentThread : CommentThread) {
    const sorted : Comment[] = commentThread.comments.sort((a : Comment, b : Comment) => {
        return (new Date(a.created).getUTCMilliseconds()) - (new Date(b.created).getUTCMilliseconds());
    });
    if (sorted.length === 0) return undefined;
    return sorted[0].user.ID;
}

export class CommentThreadHelper {
    static async newCommentThread(apiCall: any) {
        console.log("Adding comment thread from generic call");
        console.log(apiCall);

        try {
            return await apiCall();
        } catch (error) {
            if (error instanceof JsonFetchError) {
                // TODO: handle error for the user
                console.log(error);
            } else {
                throw error;
            }
        }
        return false;
    }
    static newCommentThreadFile(submissionID: string, fileID: string, comment: string, selection?: Selection, restricted?: boolean) {
        console.log("Adding comment thread on file\n----------------");

        console.log("Selection: ");
        console.log(selection);
        console.log("Comment body: " + comment);
        console.log("SubmissionID: " + submissionID);

        return CommentThreadHelper.newCommentThread(() => createFileCommentThread(fileID, {
            submissionID,
            comment,
            snippet: selection,
            visibility: restricted ? threadState.private : threadState.public
        }))
    }
    // static newCommentThreadSubmission(submissionID: string, comment: string, selection?: Selection, restricted?: boolean) {
    //     console.log("Adding comment thread for submission\n----------------");
    //
    //     console.log("Selection: ");
    //     console.log(selection);
    //     console.log("Comment body: " + comment);
    //     console.log("SubmissionID: " + submissionID);
    //
    //     return CommentThreadHelper.newCommentThread(() => createSubmissionCommentThread(submissionID, {
    //         submissionID,
    //         visibility: restricted ? threadState.private : threadState.public
    //     }))
    // }
    static newComment() {

    }
}