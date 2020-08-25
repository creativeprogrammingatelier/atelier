import { Submission } from "./Submission";
import { Mention } from "./Mention";
import { CommentThread } from "./CommentThread";
import { Comment } from "./Comment";

export type FeedItem =
    | { type: "submission", data: Submission, timestamp: string }
    | { type: "mention", data: Mention, timestamp: string }
    | { type: "commentThread", data: CommentThread, timestamp: string }
    | { type: "comment", data: Comment, timestamp: string }
