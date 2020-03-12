import React, {useState} from "react";

import {Snippet as ModelSnippet} from "../../../placeholdermodels";
import {Comment as CommentComponent} from "./Comment";
import {Snippet} from "./Snippet";
import {WriteComment} from "./WriteComment";
import {ButtonBar} from "../../general/ButtonBar";
import { Button } from "react-bootstrap";
import {FiChevronDown, FiChevronUp, FiSend} from "react-icons/all";
import { CommentThread } from "../../../../../models/api/CommentThread";
import { JsonFetchError } from "../../../../helpers/FetchHelper";
import { createComment } from "../../../../helpers/APIHelper";
import {File} from "../../../../../models/api/File";

interface CommentThreadProperties {
	/** The id for the CommentThread in the databaseRoutes */
    thread : CommentThread,
    submissionID? : string,
	file? : File,
	body? : string
	// Maybe also find a way to include the topic, so it can be shown immediately
}

/** Amount of lines to display when minimized */
const MINIMIZED_LINES = 3;
/** Amount of lines inclusive that count as a small snippet */
const SMALL_SNIPPET_LINES = 3;
/** Amount of context lines to show above for a small snippet */
const SMALL_SNIPPET_LINES_ABOVE = 2;
/** Amount of context lines to show below for a small snippet */
const SMALL_SNIPPET_LINES_BELOW = 2;
/** Amount of context lines to show above for a small snippet */
const LARGE_SNIPPET_LINES_ABOVE = 0;
/** Amount of context lines to show below for a small snippet */
const LARGE_SNIPPET_LINES_BELOW = 0;

export function CommentThread({submissionID, thread, body, file}: CommentThreadProperties) {
	const [opened, setOpened] = useState(false);
    const [comments, updateComments] = useState(thread.comments);
    const [newCommentText, updateNewCommentText] = useState("");

	let snippet : ModelSnippet | undefined = undefined;
	if (thread.snippet != undefined && body != undefined && file != undefined) {
		// Parse body into lines
		const fileContent : string[] = body.replace('\r', '').split('\n');
		const totalLines : number = fileContent.length;

		// Get snippet data
		const threadSnippet = thread.snippet;
		const lineStart : number = threadSnippet.start.line;
		const lineEnd : number = threadSnippet.end.line;

		// Get margins for the snippet
		const snippetLength : number = (lineEnd - lineStart + 1);
		const smallSnippet : boolean = snippetLength <= SMALL_SNIPPET_LINES;
		let topMargin : number = smallSnippet ? SMALL_SNIPPET_LINES_ABOVE : LARGE_SNIPPET_LINES_ABOVE;
		let bottomMargin : number = smallSnippet ? SMALL_SNIPPET_LINES_BELOW : LARGE_SNIPPET_LINES_BELOW;
		topMargin = Math.min(topMargin, lineStart);
		bottomMargin = Math.min(bottomMargin, totalLines - 1 - lineEnd);

		// Corresponding lines in the file
		const fileLineStart = lineStart - topMargin;
		const fileLineEnd = lineEnd + bottomMargin + 1;

		// Main lines to highlight first
		const mainLineStart = topMargin;
		const mainLineEnd = topMargin + Math.min(MINIMIZED_LINES, snippetLength);

		snippet = {
			submissionId : submissionID,
			fullText : fileContent.slice(fileLineStart, fileLineEnd),
			mainLines : [mainLineStart, mainLineEnd],
			fileId : file.ID,
			fileLines : [fileLineStart, fileLineEnd]
		};
	}


	const handleNewComment = async () => {
        if (newCommentText !== null && newCommentText.trim() !== "") {
            try {
                const comment = await createComment(thread.ID, {
                    commentBody : newCommentText
                });
                console.log('added comment response' + comment);
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

	//console.log(thread, snippet);
	return (
		<div id={thread.ID} className="commentThread">
			<div> {/* Assuming loading is always successful, obviously */}
                {snippet && <Snippet snippet={snippet}/>}
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