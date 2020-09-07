import React, { Fragment } from "react";
import { FeedItem } from "../../../../models/api/FeedItem";
import { CommentThread } from "../comment/CommentThread";
import { Link } from "react-router-dom";
import { Comment } from "../comment/Comment";
import { Block } from "../general/Block";
import { useTime } from "../data/TimeProvider";
import { DataBlock } from "../data/DataBlock";
import { FiFile, FiMessageSquare } from "react-icons/fi";
import { Permissions } from "../general/Permissions";
import { PermissionEnum } from "../../../../models/enums/PermissionEnum";

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
            const userLink = 
                <Permissions course={submission.references.courseID} single={PermissionEnum.viewAllUserProfiles} error={submission.user.name}>
                    <Link to={`/course/${submission.references.courseID}/user/${submission.user.ID}`}>{submission.user.name}</Link>;
                </Permissions>
            const courseLink = /*global ? <Fragment> in <Link to={`/course/${submission.references.courseID}`}>TODO: coursename</Link></Fragment> :*/ <Fragment />;
            const submissionLink = `/submission/${submission.ID}`;
            return (
                <div className="feedBlock">
                    <p>New submission by {userLink}{courseLink}:</p>
                    <DataBlock transport={submissionLink} title={submission.name} time={new Date(submission.date)}>
                        <span className="icon-label" title={`${submission.fileCount} file${submission.fileCount !== 1 ? "s" : ""}`}>
                            <FiFile /> {submission.fileCount}
                        </span>
                        <span className="icon-label" title={`${submission.threadCount} comment${submission.threadCount !== 1 ? "s" : ""}`}>
                            <FiMessageSquare /> {submission.threadCount}
                        </span>
                    </DataBlock>
                </div>
            );
            }
        case "mention": {
            const mention = data.data;
            const userLink = 
                <Permissions course={mention.references.courseID} single={PermissionEnum.viewAllUserProfiles} error={mention.comment.user.name}>
                    <Link to={`/course/${mention.references.courseID}/user/${mention.comment.user.ID}`}>{mention.comment.user.name}</Link>;
                </Permissions>
            const submissionLink = <Link to={`/submission/${mention.references.submissionID}`}>{mention.submissionTitle}</Link>;
            const courseLink = global ? <Fragment> in <Link to={`/course/${mention.references.courseID}`}>{mention.courseName}</Link></Fragment> : <Fragment />;
            const commentLink =
                mention.comment.references.fileID !== undefined 
                ? `/submission/${mention.references.submissionID}/${mention.comment.references.fileID}/comments#${mention.comment.references.commentThreadID}`
                : `/submission/${mention.references.submissionID}#${mention.comment.references.commentThreadID}`
            return (
                <div className="feedBlock">
                    {/* TODO: username for the submission (by user X) */}
                    <p>Mentioned by {userLink} on {submissionLink}{courseLink}:</p>
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
            const submissionUserLink = 
                <Permissions course={thread.references.courseID} single={PermissionEnum.viewAllUserProfiles} error={thread.submission.user.userName}>
                    <Link to={`/course/${thread.references.courseID}/user/${thread.submission.user.ID}`}>{thread.submission.user.userName}</Link>;
                </Permissions>
            const courseLink = /*global ? <Fragment> in <Link to={`/course/${thread.references.courseID}`}>TODO: coursename</Link></Fragment> :*/ <Fragment />;
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