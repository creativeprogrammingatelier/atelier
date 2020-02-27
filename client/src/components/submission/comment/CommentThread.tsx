import React, {useState} from "react";

import * as Models from "../../../placeholdermodels";

import {Header} from "../../frame/Header";
import {Comment as CommentComponent} from "./Comment";
import {Snippet} from "./Snippet";
import {WriteComment} from "./WriteComment";
import {ButtonBar} from "../../general/ButtonBar";
import { Button } from "react-bootstrap";
import {FiChevronDown, FiChevronUp, FiSend} from "react-icons/all";
import {ExtendedThread} from "../../../../../models/database/Thread";
import {Comment} from "../../../../../models/database/Comment";
import { JsonFetchError } from "../../../../helpers/FetchHelper";
import { createComment } from "../../../../helpers/APIHelper";

interface CommentThreadProperties {
	/** The id for the CommentThread in the databaseRoutes */
	thread : ExtendedThread,
	body? : string
	// Maybe also find a way to include the topic, so it can be shown immediately
}

/** Amount of lines to display when minimized*/
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

export function CommentThread({thread, body}: CommentThreadProperties) {
    // Load comments in the thread
	const currentComments : Models.Comment[] = thread.comments
		.map((comment : Comment) => {
			return {
				text : comment.body == undefined ? "" : comment.body,
				author : comment.userID == undefined ? "" : comment.userID ,
				time : comment.date == undefined ? new Date() : comment.date
			}
		});

	const [opened, setOpened] = useState(false);
	const [comments, updateComments] = useState(currentComments);

	let snippet : Models.Snippet | undefined = undefined;
	if (body != undefined && thread.snippet != undefined) {
		// Parse body into lines
		const fileContent : string[] = body.replace('\r', '').split('\n');
		const totalLines : number = fileContent.length;

		// Get snippet data
		const threadSnippet = thread.snippet;
		const lineStart : number = threadSnippet.lineStart;
		const lineEnd : number = threadSnippet.lineEnd;

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

		// Define snippet for render
		// TODO fileID
		snippet = {
			fullText : fileContent.slice(fileLineStart, fileLineEnd),
			mainLines : [mainLineStart, mainLineEnd],
			fileId : "00000000-0000-0000-0000-000000000000",
			fileLines : [fileLineStart, fileLineEnd]
		};
	}


	const newComment = async (text: string) => {
        try {
            const comment = await createComment(thread.commentThreadID!, {
                body : text
            });
            console.log(comment);
            updateComments(comments => [
                ...comments,
                {text : comment.body, author : comment.userID, time : comment.date} as Models.Comment
            ]);
        } catch (err) {
            if (err instanceof JsonFetchError) {
                // TODO: handle error for user
                console.log(err);
            } else {
                throw err;
            }
        }
	};

	//console.log(thread, snippet);
	return (
		<div className="commentThread">
			<div> {/* Assuming loading is always successful, obviously */}
                {snippet && <Snippet snippet={snippet}/>}
                {opened ? <div>
                        {comments.map(comment => <CommentComponent comment={comment}/>)}
                        <WriteComment placeholder="Reply..." newCommentCallback={newComment}/>
                        <ButtonBar align="right">
                            <Button><FiSend size={14} color="#FFFFFF"/></Button>
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