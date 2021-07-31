import {CommentThread} from "../models/api/CommentThread";
import {Comment} from "../models/api/Comment";

export function commentThreadOwner(commentThread: CommentThread) {
    const sorted: Comment[] = commentThread.comments.sort((a: Comment, b: Comment) => {
        return (new Date(a.created).getUTCMilliseconds()) - (new Date(b.created).getUTCMilliseconds());
    });
    if (sorted.length === 0) {
        return undefined;
    }
    return sorted[0].user.ID;
}
