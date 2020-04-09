import React, {Fragment, useState} from "react";
import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";
import {FiChevronDown, FiChevronUp, FiCode, FiEye, FiEyeOff, FiTrash} from "react-icons/all";

import {CommentThread} from "../../../../models/api/CommentThread";
import {ThreadState} from "../../../../models/enums/ThreadStateEnum";
import {containsPermission, PermissionEnum} from "../../../../models/enums/PermissionEnum";

import {commentThreadOwner} from "../../../../helpers/CommentThreadHelper";

import {Snippet} from "../code/Snippet";
import { Block } from "../general/Block";
import {ButtonBar} from "../input/button/ButtonBar";
import {FeedbackContent} from "../feedback/Feedback";
import {FeedbackError} from "../feedback/FeedbackError";
import { FeedbackSuccess } from "../feedback/FeedbackSuccess";
import {Comment as CommentComponent} from "./Comment";
import {CommentCreator} from "./CommentCreator";
import {useCollectionCombined, useComments, useCoursePermission, useCurrentUser, useCommentThread} from "../../helpers/api/APIHooks";
import {Cached} from "../general/loading/Cached";

interface CommentThreadProperties {
	/** The id for the CommentThread in the databaseRoutes */
	thread: CommentThread
}

interface ManageRestrictedButtonsProperties {
    thread: CommentThread,
    onDiscard: () => void, 
    onToggle: () => void
}
function ManageRestrictedButtons({ thread, onDiscard, onToggle }: ManageRestrictedButtonsProperties) {
    const permission = useCoursePermission(thread.references.courseID);
    const user = useCurrentUser();

    return (
        <Cached cache={permission} wrapper={_ => <Fragment />}>
            {permission =>
                <Cached cache={user} wrapper={_ => <Fragment />}>
                    {user => {
                        if (containsPermission(PermissionEnum.manageRestrictedComments, permission.permissions) 
                            || user.ID === commentThreadOwner(thread)) {
                            return (
                                <Fragment>
                                    <Button onClick={onDiscard}><FiTrash size={14} color="#FFFFFF"/></Button>
                                    <Button onClick={onToggle}>{thread.visibility === ThreadState.private ? <FiEyeOff size={14} color="#FFFFFF"/> : <FiEye size={14} color="#FFFFFF"/>}</Button>
                                </Fragment>
                            );
                        } else {
                            return <Fragment />;
                        }
                    }}
                </Cached>
            }
        </Cached>
    );
}

export function CommentThread({thread}: CommentThreadProperties) {
    const threadCache = useCommentThread(thread.references.submissionID, thread.ID, thread.file?.ID);
    const comments = useComments(thread.ID);
    const commentsCombined = {
        observable: useCollectionCombined(comments.observable)
    };

	const [opened, setOpened] = useState(window.location.hash.substr(1) === thread.ID);
	const [success, setSuccess] = useState(false as FeedbackContent);
	const [error, setError] = useState(false as FeedbackContent);

	const handleCommentSend = async(comment: string) => {
		const commentTrimmed = comment.trim();
        return comments.create(commentTrimmed)
            .then(comment => true)
            .catch((err: Error) => {
                setError("Failed to create reply: " + err.message)
                return false;
            });
	};
	const handleDiscard = () => {
        threadCache.delete()
            .then(thread => setSuccess("This thread of comments has been deleted."))
            .catch((err: Error) => setError(`Thread could not be deleted: ${err.message}`));
	};
	const handleVisibility = () => {
        threadCache.update(thread.visibility === ThreadState.public ? ThreadState.private : ThreadState.public)
            .then(thread => setSuccess(`Visibility updated, now: ${thread.visibility}`))
            .catch((err: Error) => setError(`Changing visibility failed: ${err.message}`));
    };

	return <div className="mb-3">
		<Block id={thread.ID} className={"commentThread" + (thread.visibility === ThreadState.private ? " restricted" : "")}>
			{thread.snippet && <Snippet snippet={thread.snippet} expanded={opened}/>}
            <Cached cache={commentsCombined}>
                {comments => opened ?
                    <Fragment>
                        {comments.map(comment => <CommentComponent key={comment.ID} comment={comment}/>)}
                        <CommentCreator transparent placeholder="Reply..." mentions={{courseID: thread.references.courseID}} sendHandler={handleCommentSend}/>
                    </Fragment>
                    :
                    comments[0] !== undefined && <CommentComponent key={comments[0].ID} comment={comments[0]}/>
                }
            </Cached>
			<ButtonBar align="right">
				<ManageRestrictedButtons thread={thread} onToggle={handleVisibility} onDiscard={handleDiscard}/>
				{thread.file && thread.snippet &&
					<Link to={`/submission/${thread.references.submissionID}/${thread.file.ID}/view#${thread.snippet.start.line + 1}`}>
						<Button>
							<FiCode size={14} color="#FFFFFF"/>
						</Button>
					</Link>
				}
				<Button onClick={() => setOpened(!opened)}>{opened ? <FiChevronUp size={14} color="#FFFFFF"/> : <FiChevronDown size={14} color="#FFFFFF"/>}</Button>
			</ButtonBar>
		</Block>
		<FeedbackSuccess close={setSuccess}>{success}</FeedbackSuccess>
		<FeedbackError close={setError}>{error}</FeedbackError>
	</div>;
}