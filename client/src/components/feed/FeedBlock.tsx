import React, {Fragment} from "react";
import {FeedItem} from "../../../../models/api/FeedItem";
import {CommentThread} from "../comment/CommentThread";
import {Link} from "react-router-dom";
import {Comment} from "../comment/Comment";
import {Block} from "../general/Block";
import {DataBlock} from "../data/DataBlock";
import {FiFile, FiMessageSquare} from "react-icons/fi";
import {Permissions} from "../general/Permissions";
import {PermissionEnum} from "../../../../models/enums/PermissionEnum";
import {ThreadState} from "../../../../models/enums/ThreadStateEnum";
import {assertNever} from "../../../../helpers/Never";

/**
 * Interface defining properties of a FeedBlock
 */
interface FeedBlockProperties {
    isGlobal: boolean,
    data: FeedItem
}

/**
 * Function for constructing a FeedBlock based on the props passed, returning Block at the end.
 *
 * @param data Data of the FeedBlock, be it a submission comment or something else.
 * @param global Boolean setting if the FeedBlock is global or course specific.
 */
export function FeedBlock({data, isGlobal}: FeedBlockProperties) {
    switch (data.type) {
    case "submission": {
        const submission = data.data;
        const userLink =
            <Permissions course={submission.references.courseID} single={PermissionEnum.viewAllUserProfiles} error={submission.user.name}>
                <Link to={`/course/${submission.references.courseID}/user/${submission.user.ID}`}>{submission.user.name}</Link>
            </Permissions>;
        const courseLink = /* isGlobal ? <Fragment> in <Link to={`/course/${submission.references.courseID}`}>TODO: coursename</Link></Fragment> :*/ <Fragment />;
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
                <Link to={`/course/${mention.references.courseID}/user/${mention.comment.user.ID}`}>{mention.comment.user.name}</Link>
            </Permissions>;
        const submissionLink = <Link to={`/submission/${mention.references.submissionID}`}>{mention.submissionTitle}</Link>;
        const courseLink = isGlobal ? <Fragment> in <Link to={`/course/${mention.references.courseID}`}>{mention.courseName}</Link></Fragment> : <Fragment />;
        const commentLink =
                mention.comment.references.fileID !== undefined ?
                    `/submission/${mention.references.submissionID}/${mention.comment.references.fileID}/comments#${mention.comment.references.commentThreadID}` :
                    `/submission/${mention.references.submissionID}#${mention.comment.references.commentThreadID}`;
        return (
            <div className="feedBlock">
                {/* TODO: username for the submission (by user X) */}
                <p>Mentioned by {userLink} on {submissionLink}{courseLink}:</p>
                {/* .thread is not nullable, but it may not exist in old data (such as stored in the cache) */}
                <Block className={mention.comment.thread?.visibility === ThreadState.private ? "restricted" : ""}>
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
                <Link to={`/course/${thread.references.courseID}/user/${thread.submission.user.ID}`}>{thread.submission.user.userName}</Link>
            </Permissions>;
        const courseLink = /* isGlobal ? <Fragment> in <Link to={`/course/${thread.references.courseID}`}>TODO: coursename</Link></Fragment> :*/ <Fragment />;
        let relationIndicator = <Fragment />;
        switch (data.relation) {
        case "yourSubmission":
            relationIndicator = <p>New comment on {submissionLink}{courseLink}:</p>;
            break;
        case undefined:
            relationIndicator = <p>New comment on {submissionLink} (by {submissionUserLink}){courseLink}:</p>;
            break;
        default:
            assertNever(data);
        }
        return (
            <div className="feedBlock">
                {relationIndicator}
                <CommentThread thread={thread} />
            </div>
        );
    }
    case "comment": {
        const comment = data.data;
        const submissionLink = <Link to={`/submission/${comment.references.submissionID}`}>{comment.submission.name}</Link>;
        const submissionUserLink =
                <Permissions course={comment.references.courseID} single={PermissionEnum.viewAllUserProfiles} error={comment.submission.user.userName}>
                    <Link to={`/course/${comment.references.courseID}/user/${comment.submission.user.ID}`}>{comment.submission.user.userName}</Link>
                </Permissions>;
        const courseLink = /* isGlobal ? <Fragment> in <Link to={`/course/${comment.references.courseID}`}>TODO: coursename</Link></Fragment> :*/ <Fragment />;
        const commentLink =
                comment.references.fileID !== undefined ?
                    `/submission/${comment.references.submissionID}/${comment.references.fileID}/comments#${comment.references.commentThreadID}` :
                    `/submission/${comment.references.submissionID}#${comment.references.commentThreadID}`;
        let relationIndicator = <Fragment />;
        switch (data.relation) {
        case "yourSubmission":
            relationIndicator = <p>New reply in a thread on your submission {submissionLink}{courseLink}:</p>;
            break;
        case "participated":
            relationIndicator = <p>
                New reply in a thread you&apos;re in (on {submissionLink} by {submissionUserLink}){courseLink}:
            </p>;
            break;
        case undefined:
            relationIndicator = <p>New reply on {submissionLink} (by {submissionUserLink}){courseLink}:</p>;
            break;
        default:
            assertNever(data);
        }
        return (
            <div className="feedBlock">
                {relationIndicator}
                {/* .thread is not nullable, but it may not exist in old data (such as stored in the cache) */}
                <Block className={comment.thread?.visibility === ThreadState.private ? "restricted" : ""}>
                    <Link to={commentLink}>
                        <Comment comment={comment} />
                    </Link>
                </Block>
            </div>
        );
    }
    default:
        assertNever(data);
        return (<Fragment />);
    }
}
