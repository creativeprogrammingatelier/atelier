import React, {Fragment, useEffect, useState} from "react";

import {Comment as CommentComponent} from "./Comment";
import {ButtonBar} from "../general/ButtonBar";
import {Button} from "react-bootstrap";
import {FiChevronDown, FiChevronUp, FiCode, FiEye, FiEyeOff, FiTrash} from "react-icons/all";
import {CommentThread} from "../../../../models/api/CommentThread";
import {JsonFetchError} from "../../../helpers/FetchHelper";
import {coursePermission, createComment, getCurrentUser, setCommentThreadVisibility} from "../../../helpers/APIHelper";
import {File} from "../../../../models/api/File";
import {Snippet} from "../code/Snippet";
import {Link} from "react-router-dom";
import {CommentCreator} from "./CommentCreator";
import {ScrollHelper} from "../../helpers/ScrollHelper";
import {Permission} from "../../../../models/api/Permission";
import {containsPermission, PermissionEnum} from "../../../../models/enums/permissionEnum";
import {User} from "../../../../models/api/User";
import {commentThreadOwner} from "../../../../helpers/CommentThreadHelper";
import {threadState} from "../../../../models/enums/threadStateEnum";
import {Block} from "../general/Block";

interface CommentThreadProperties {
	/** The id for the CommentThread in the databaseRoutes */
	thread: CommentThread,
	submissionID?: string,
	file?: File,
	body?: string
}

export function CommentThread({thread}: CommentThreadProperties) {
	const [opened, setOpened] = useState(window.location.hash.substr(1) === thread.ID);
	const [restricted, setRestricted] = useState(thread.visibility === threadState.private);
	const [manageRestrictedComments, setManageRestrictedComments] = useState(false);
	const [comments, updateComments] = useState(thread.comments);

	const handleCommentSend = async(comment: string) => {
		const commentTrimmed = comment.trim();
		if (commentTrimmed !== "") {
			try {
				const comment = await createComment(thread.ID, commentTrimmed);
				updateComments(comments => [
					...comments,
					comment
				]);
				return true;
			} catch (error) {
				if (error instanceof JsonFetchError) {
					// TODO: handle error for user
					console.log(error);
				} else {
					throw error;
				}
			}
		}
		return false;
	};
	const handleDiscard = () => {
		console.log("Clicked to discard");
	};
	const handleVisibility = () => {
		setCommentThreadVisibility(thread.ID, restricted)
			.then((commentThread : CommentThread) => {
				setRestricted(commentThread.visibility === threadState.private);
			});
		// TODO: Some form of success feedback, probably
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

	return (
		<Block id={thread.ID} className={"commentThread" + (restricted ? " restricted" : "")}>
			{thread.snippet && <Snippet snippet={thread.snippet} expanded={opened}/>}
			{opened ?
				<Fragment>
					{comments.map(comment => <CommentComponent comment={comment}/>)}
					<CommentCreator transparent placeholder="Reply..." mentions={{courseID: thread.references.courseID}} sendHandler={handleCommentSend}/>
				</Fragment>
				:
				comments[0] !== undefined && <CommentComponent comment={comments[0]}/>
			}
			<ButtonBar align="right">
				{manageRestrictedComments &&
					<Fragment>
						<Button onClick={handleDiscard}><FiTrash size={14} color="#FFFFFF"/></Button>
						<Button onClick={handleVisibility}>{restricted ? <FiEyeOff size={14} color="#FFFFFF"/> : <FiEye size={14} color="#FFFFFF"/>}</Button>
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
	);
}