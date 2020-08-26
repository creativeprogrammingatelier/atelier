import { Submission } from "./Submission";
import { Mention } from "./Mention";
import { CommentThread } from "./CommentThread";
import { Comment } from "./Comment";

export type FeedItem =
    { ID: string; timestamp: string } & (
        | { type: "submission", data: Submission }
        | { type: "mention", data: Mention }
        | { type: "commentThread", data: CommentThread, relation?: "participated" | "yourSubmission" }
        | { type: "comment", data: Comment, relation?: "participated" | "yourSubmission" }
    )
