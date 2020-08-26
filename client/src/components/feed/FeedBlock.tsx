import React, { Fragment } from "react";
import { FeedItem } from "../../../../models/api/FeedItem";
import { CommentThread } from "../comment/CommentThread";
import { DataBlock } from "../data/DataBlock";

/** Helper function to make sure a switch is exhaustive */
function assertNever(x: never) {
	throw Error(`Object should be never: ${x}`);
}

interface FeedBlockProperties {
    data: FeedItem
}

export function FeedBlock({ data }: FeedBlockProperties) {
    switch (data.type) {
        case "submission":
            const submission = data.data;
            return (
                <DataBlock
                    transport={`/submission/${submission.ID}`}
                    title={"Submission: " + submission.name}
                    text={"By " + submission.user.name}
                    time={new Date(submission.date)}
                />
            );
        case "mention":
            const mention = data.data;
            return (
                <DataBlock
                    title={`Mentioned by ${mention.comment.user.name} on ${mention.submissionTitle} in ${mention.courseName}`}
                    text={mention.comment.text}
                    time={new Date(mention.comment.created)}
                    transport={
                        mention.comment.references.fileID !== undefined 
                        ? `/submission/${mention.references.submissionID}/${mention.comment.references.fileID}/comments#${mention.comment.references.commentThreadID}`
                        : `/submission/${mention.references.submissionID}#${mention.comment.references.commentThreadID}`
                    }
                />
            );
        case "commentThread":
            return <CommentThread thread={data.data} />;
        case "comment":
            return (<Fragment />);
        default:
            assertNever(data);
            return (<Fragment />);
    }
}