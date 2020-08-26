import React, { Fragment } from "react";
import { FeedItem } from "../../../../models/api/FeedItem";
import { CommentThread } from "../comment/CommentThread";
import { Link } from "react-router-dom";
import { Comment } from "../comment/Comment";
import { Block } from "../general/Block";
import { useTime } from "../data/TimeProvider";
import { TimeHelper } from "../../helpers/TimeHelper";
import { DataItem } from "../data/DataItem";

/** Helper function to make sure a switch is exhaustive */
function assertNever(x: never) {
	throw Error(`Object should be never: ${x}`);
}

interface FeedBlockProperties {
    global: boolean,
    data: FeedItem
}

export function FeedBlock({ data, global }: FeedBlockProperties) {
    const currentTime = useTime();
    switch (data.type) {
        case "submission": {
            const submission = data.data;
            const userLink = <Link to={`/course/${submission.references.courseID}/user/${submission.user.ID}`}>{submission.user.name}</Link>;
            const courseLink = global ? <Fragment> in <Link to={`/course/${submission.references.courseID}`}>TODO: coursename</Link></Fragment> : <Fragment />;
            const submissionLink = `/submission/${submission.ID}`;
            return (
                <div className="feedBlock">
                    <p>New submission by {userLink}{courseLink}:</p>
                    <DataItem transport={submissionLink} text={submission.name}>
                        <small className="text-muted text-right">{TimeHelper.howLongAgo(new Date(submission.date), currentTime)}</small>
                    </DataItem>
                </div>
            );
            }
        case "mention": {
            const mention = data.data;
            const userLink = <Link to={`/course/${mention.references.courseID}/user/${mention.comment.user.ID}`}>{mention.comment.user.name}</Link>;
            const submissionLink = <Link to={`/submission/${mention.references.submissionID}`}>{mention.submissionTitle}</Link>;
            const courseLink = global ? <Fragment> in <Link to={`/course/${mention.references.courseID}`}>{mention.courseName}</Link></Fragment> : <Fragment />;
            const commentLink =
                mention.comment.references.fileID !== undefined 
                ? `/submission/${mention.references.submissionID}/${mention.comment.references.fileID}/comments#${mention.comment.references.commentThreadID}`
                : `/submission/${mention.references.submissionID}#${mention.comment.references.commentThreadID}`
            return (
                <div className="feedBlock">
                    <p>Mentioned by {userLink} on {submissionLink} (by TODO: user){courseLink}:</p>
                    <Block>
                        <Link to={commentLink}>
                            <Comment comment={mention.comment} />
                        </Link>
                    </Block>
                </div>
            );
        }
        case "commentThread": {
            const thread = data.data;
            const submissionLink = <Link to={`/submission/${thread.references.submissionID}`}>{thread.submission.name}</Link>;
            const submissionUserLink = <Link to={`/course/${thread.references.courseID}/user/${thread.submission.user.ID}`}>{thread.submission.user.userName}</Link>;
            const courseLink = global ? <Fragment> in <Link to={`/course/${thread.references.courseID}`}>TODO: coursename</Link></Fragment> : <Fragment />;
            let relationIndicator = <Fragment />;
            switch (data.relation) {
                case "yourSubmission":
                    relationIndicator = <p>New comment on {submissionLink}{courseLink}:</p>;
                    break;
                case "participated":
                    relationIndicator = <p>New reply on {submissionLink} (by {submissionUserLink}){courseLink}:</p>;
                    break;
                case undefined:
                    relationIndicator = <p>New comment on {submissionLink} (by {submissionUserLink}){courseLink}:</p>;
                    break;
                default:
                    assertNever(data.relation);
            }
            return (
                <div className="feedBlock">
                    {relationIndicator}
                    <CommentThread thread={thread} />
                </div>
            );
        }
        case "comment":
            return (<Fragment />);
        default:
            assertNever(data);
            return (<Fragment />);
    }
}