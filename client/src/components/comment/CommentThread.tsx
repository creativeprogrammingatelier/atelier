import React, {useState} from "react";

import {Comment as CommentComponent} from "./Comment";
import {ButtonBar} from "../general/ButtonBar";
import {Button} from "react-bootstrap";
import {FiChevronDown, FiChevronUp, FiCode} from "react-icons/all";
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
	const [opened, setOpened] = useState(false);
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

	return (
		<div id={thread.ID} className="commentThread">
			{thread.snippet && <Snippet snippet={thread.snippet} expanded={opened}/>}
			{opened ? <div>
				{comments.map(comment => <CommentComponent comment={comment}/>)}
				<CommentCreator sendHandler={handleCommentSend}/>
				<ButtonBar align="right">
					{thread.file && thread.snippet &&
					<Button>
						<Link to={`/submission/${thread.references.submissionID}/${thread.file.ID}/code#${thread.snippet.start.line + 1}`}>
							<FiCode size={14} color="#FFFFFF"/>
						</Link>
					</Button>
					}
					<Button onClick={() => setOpened(false)}><FiChevronUp size={14} color="#FFFFFF"/></Button>
				</ButtonBar>
			</div>
			: comments[0] !== undefined && <div>
				<CommentComponent comment={comments[0]}/>
				<ButtonBar align="right">
					{thread.file && thread.snippet &&
					<Button>
						<Link to={`/submission/${thread.references.submissionID}/${thread.file.ID}/code#${thread.snippet.start.line + 1}`}>
							<FiCode size={14} color="#FFFFFF"/>
						</Link>
					</Button>
					}
					<Button onClick={() => setOpened(true)}><FiChevronDown size={14} color="#FFFFFF"/></Button>
				</ButtonBar>
			</div>
			}
		</div>
	);
}