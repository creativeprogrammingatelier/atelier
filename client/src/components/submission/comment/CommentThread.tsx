import React, {useState} from "react";

import {Comment as CommentComponent} from "./Comment";
import {WriteComment} from "./WriteComment";
import {ButtonBar} from "../../general/ButtonBar";
import { Button } from "react-bootstrap";
import {FiChevronDown, FiChevronUp, FiSend} from "react-icons/all";
import { CommentThread } from "../../../../../models/api/CommentThread";
import { JsonFetchError } from "../../../../helpers/FetchHelper";
import { createComment } from "../../../../helpers/APIHelper";
import {File} from "../../../../../models/api/File";
import {Snippet} from "./Snippet";

interface CommentThreadProperties {
	/** The id for the CommentThread in the databaseRoutes */
    thread : CommentThread,
    submissionID? : string,
	file? : File,
	body? : string
}

export function CommentThread({submissionID, thread, body, file}: CommentThreadProperties) {
	const [opened, setOpened] = useState(false);
    const [comments, updateComments] = useState(thread.comments);
    const [newCommentText, updateNewCommentText] = useState("");

	const handleNewComment = async () => {
        if (newCommentText !== null && newCommentText.trim() !== "") {
            try {
                const comment = await createComment(thread.ID, {
                    commentBody : newCommentText
                });
                updateComments(comments => [
                    ...comments,
                    comment
                ]);
                updateNewCommentText("");
            } catch (err) {
                if (err instanceof JsonFetchError) {
                    // TODO: handle error for user
                    console.log(err);
                } else {
                    throw err;
                }
            }
        }
	};

    return (
		<div id={thread.ID} className="commentThread">
			<div>
				{/* Assuming loading is always successful, obviously */}
				{thread.snippet && <Snippet snippet={thread.snippet}/>}
                {opened ? <div>
                        {comments.map(comment => <CommentComponent comment={comment}/>)}
                        <WriteComment courseID={thread.references.courseID} placeholder="Reply..." text={newCommentText} updateText={updateNewCommentText} />
                        <ButtonBar align="right">
                            <Button onClick={handleNewComment}><FiSend size={14} color="#FFFFFF"/></Button>
                            <Button onClick={() => setOpened(false)}><FiChevronUp size={14} color="#FFFFFF"/></Button>
                        </ButtonBar>
                    </div>
                    : comments[0] !== undefined && <div>
                        <CommentComponent comment={comments[0]}/>
                        <ButtonBar align="right">
                            <Button onClick={() => setOpened(true)}><FiChevronDown size={14} color="#FFFFFF"/></Button>
                        </ButtonBar>
                    </div>
                }
            </div>
		</div>
	);
}