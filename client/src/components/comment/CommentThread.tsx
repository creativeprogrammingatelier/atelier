import React, {useState, Fragment} from "react";

import {Comment as CommentComponent} from "./Comment";
import {ButtonBar} from "../general/ButtonBar";
import {Button} from "react-bootstrap";
import {FiChevronDown, FiChevronUp, FiCode, FiEye, FiEyeOff, FiTrash} from "react-icons/all";
import {CommentThread} from "../../../../models/api/CommentThread";
import {JsonFetchError} from "../../../helpers/FetchHelper";
import {createComment} from "../../../helpers/APIHelper";
import {File} from "../../../../models/api/File";
import {Snippet} from "./Snippet";
import {Link} from "react-router-dom";
import {CommentCreator} from "./CommentCreator";

interface CommentThreadProperties {
	/** The id for the CommentThread in the databaseRoutes */
	thread: CommentThread,
	submissionID?: string,
	file?: File,
	body?: string
}

export function CommentThread({thread}: CommentThreadProperties) {
	const [opened, setOpened] = useState(window.location.hash.substr(1) === thread.ID);
	const [restricted, setRestricted] = useState(Boolean(thread.visibility));
	const [manageRestrictedComments, setManageRestrictedComments] = useState(true); // TODO: Actual permission check
	const [comments, updateComments] = useState(thread.comments);

	const handleCommentSend = async(comment: string) => {
		const commentTrimmed = comment.trim();
		if (commentTrimmed !== "") {
			try {
				const comment = await createComment(thread.ID, {
					commentBody: commentTrimmed
				});
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
		console.log("Clicked to toggle visibility");
		setRestricted(!restricted);
		// TODO: Update server
		// TODO: Some form of success feedback, probably
	};

	return (
		<div id={thread.ID} className="commentThread">
			{thread.snippet && <Snippet snippet={thread.snippet} expanded={opened}/>}
			{opened ?
				<Fragment>
					{comments.map(comment => <CommentComponent comment={comment}/>)}
					<CommentCreator sendHandler={handleCommentSend}/>
				</Fragment>
				:
				comments[0] !== undefined && <CommentComponent comment={comments[0]}/>
			}
			<ButtonBar align="right">
				{manageRestrictedComments &&
					<Fragment>
						<Button onClick={handleDiscard}><FiTrash size={14} color="#FFFFFF"/></Button>
						<Button onClick={handleVisibility}>{restricted ? <FiEye size={14} color="#FFFFFF"/> : <FiEyeOff size={14} color="#FFFFFF"/>}</Button>
					</Fragment>
				}
				{thread.file && thread.snippet &&
					<Link to={`/submission/${thread.references.submissionID}/${thread.file.ID}/code#${thread.snippet.start.line + 1}`}>
						<Button>
							<FiCode size={14} color="#FFFFFF"/>
						</Button>
					</Link>
				}
				<Button onClick={() => setOpened(!opened)}>{opened ? <FiChevronDown size={14} color="#FFFFFF"/> : <FiChevronUp size={14} color="#FFFFFF"/>}</Button>
			</ButtonBar>
		</div>
	);
}