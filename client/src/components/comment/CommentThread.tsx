import React, {Fragment, useEffect, useState} from "react";

import {Comment as CommentComponent} from "./Comment";
import {ButtonBar} from "../general/ButtonBar";
import {Button} from "react-bootstrap";
import {FiChevronDown, FiChevronUp, FiCode, FiEye, FiEyeOff, FiTrash} from "react-icons/all";
import {CommentThread} from "../../../../models/api/CommentThread";
import {coursePermission, getCurrentUser, setCommentThreadVisibility} from "../../../helpers/APIHelper";
import {Snippet} from "../code/Snippet";
import {Link} from "react-router-dom";
import {CommentCreator} from "./CommentCreator";
import {ScrollHelper} from "../../helpers/ScrollHelper";
import {Permission} from "../../../../models/api/Permission";
import {containsPermission, PermissionEnum} from "../../../../models/enums/permissionEnum";
import {User} from "../../../../models/api/User";
import {commentThreadOwner} from "../../../../helpers/CommentThreadHelper";
import { useComments, useCollectionCombined } from "../../helpers/api/APIHooks";
import { Cached } from "../general/loading/Cached";
import {ThreadState} from "../../../../models/enums/threadStateEnum";

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
	const [restricted, setRestricted] = useState(thread.visibility === ThreadState.private);
	const [manageRestrictedComments, setManageRestrictedComments] = useState(false);

	const handleCommentSend = async(comment: string) => {
		const commentTrimmed = comment.trim();
		return comments.create(commentTrimmed);
	};
	const handleDiscard = () => {
		console.log("Clicked to discard");
	};
	const handleVisibility = () => {
		setCommentThreadVisibility(thread.ID, restricted)
			.then((commentThread : CommentThread) => {
				setRestricted(commentThread.visibility === ThreadState.private);
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
		<div id={thread.ID} className={"commentThread block" + (restricted ? " restricted" : "")}>
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
		</div>
	);
}