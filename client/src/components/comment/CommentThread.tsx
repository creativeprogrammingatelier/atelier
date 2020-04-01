import React, {Fragment, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";
import {FiChevronDown, FiChevronUp, FiCode, FiEye, FiEyeOff, FiTrash} from "react-icons/all";

import {CommentThread} from "../../../../models/api/CommentThread";
import {File} from "../../../../models/api/File";
import {Permission} from "../../../../models/api/Permission";
import {User} from "../../../../models/api/User";
import {ThreadState} from "../../../../models/enums/threadStateEnum";
import {containsPermission, PermissionEnum} from "../../../../models/enums/permissionEnum";

import {coursePermission, createComment, getCurrentUser, setCommentThreadVisibility} from "../../../helpers/APIHelper";
import {commentThreadOwner} from "../../../../helpers/CommentThreadHelper";
import {JsonFetchError} from "../../../helpers/FetchHelper";
import {ScrollHelper} from "../../helpers/ScrollHelper";

import {Snippet} from "../code/Snippet";
import { Block } from "../general/Block";
import {ButtonBar} from "../input/button/ButtonBar";
import {FeedbackContent} from "../feedback/Feedback";
import {FeedbackError} from "../feedback/FeedbackError";
import { FeedbackSuccess } from "../feedback/FeedbackSuccess";
import {Comment as CommentComponent} from "./Comment";
import {CommentCreator} from "./CommentCreator";

interface CommentThreadProperties {
	/** The id for the CommentThread in the databaseRoutes */
	thread: CommentThread
}

export function CommentThread({thread}: CommentThreadProperties) {
    const comments = useComments(thread.ID);
    const commentsCombined = {
        observable: useCollectionCombined(comments.observable)
    }

	const [opened, setOpened] = useState(window.location.hash.substr(1) === thread.ID);
	const [visible, setRestricted] = useState(thread.visibility === ThreadState.private);
	const [manageRestrictedComments, setManageRestrictedComments] = useState(false);
	const [success, setSuccess] = useState(false as FeedbackContent);
	const [error, setError] = useState(false as FeedbackContent);

	const handleCommentSend = async(comment: string) => {
		const commentTrimmed = comment.trim();
		return comments.create(commentTrimmed);
	};
	const handleDiscard = () => {
		// TODO: Lol, maybe actually implement this
		console.log("Clicked to discard");
	};
	const handleVisibility = () => {
		setCommentThreadVisibility(thread.ID, visible).then((commentThread : CommentThread) => {
			setRestricted(commentThread.visibility === ThreadState.private);
		});
		setSuccess(`Visibility updated, now: ${visible ? "public" : "private"}`);
	};

	useEffect(() => ScrollHelper.scrollToHash(), []);
	useEffect(() => {
		coursePermission(thread.references.courseID)
			.then((permission : Permission) => {
				if (containsPermission(PermissionEnum.manageRestrictedComments, permission.permissions)) {
					setManageRestrictedComments(true);
				}
			});
		getCurrentUser()
			.then((user : User) => {
				if (user.ID === commentThreadOwner(thread)) {
					setManageRestrictedComments(true);
				}
			});
	}, []);

	return <div className="mb-3">
		<Block id={thread.ID} className={"commentThread" + (visible ? " restricted" : "")}>
			{thread.snippet && <Snippet snippet={thread.snippet} expanded={opened}/>}
            <Cached cache={commentsCombined}>
                {comments => opened ?
                    <Fragment>
                        {comments.map(comment => <CommentComponent comment={comment}/>)}
                        <CommentCreator transparent placeholder="Reply..." mentions={{courseID: thread.references.courseID}} sendHandler={handleCommentSend}/>
                    </Fragment>
                    :
                    comments[0] !== undefined && <CommentComponent comment={comments[0]}/>
                }
            </Cached>
			<ButtonBar align="right">
				{manageRestrictedComments &&
					<Fragment>
						<Button onClick={handleDiscard}><FiTrash size={14} color="#FFFFFF"/></Button>
						<Button onClick={handleVisibility}>{visible ? <FiEyeOff size={14} color="#FFFFFF"/> : <FiEye size={14} color="#FFFFFF"/>}</Button>
					</Fragment>
				}
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