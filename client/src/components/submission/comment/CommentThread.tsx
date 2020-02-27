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

	let snippet : Models.Snippet | undefined;
	if (body != undefined) {
		// Parse body into lines
		const fileContent : string[] = body.replace('\r', '').split('\n');
		const totalLines : number = fileContent.length;

		// Get snippet data
		const threadSnippet = thread.snippet!;
		const lineStart : number = threadSnippet.lineStart;
		const lineEnd : number = threadSnippet.lineEnd;

		// Get ranges for minimized/maximized inclusive
		const smallSnippet : boolean = (lineEnd - lineStart + 1) <= SMALL_SNIPPET_LINES;
		const mainLineStart = lineStart;
		const mainLineEnd = Math.min(lineEnd, lineStart + MINIMIZED_LINES);
		const fileLineStart = Math.max(0, lineStart - (smallSnippet ? SMALL_SNIPPET_LINES_ABOVE : LARGE_SNIPPET_LINES_ABOVE));
		const fileLineEnd = Math.min(totalLines - 1, lineEnd + (smallSnippet ? SMALL_SNIPPET_LINES_BELOW : LARGE_SNIPPET_LINES_BELOW));

		// Define snippet for render
		// TODO fileID
		snippet = {
			fullText : fileContent.slice(fileLineStart, fileLineEnd + 1),
			mainLines : [mainLineStart, mainLineEnd + 1],
			fileId : "00000000-0000-0000-0000-000000000000",
			fileLines : [fileLineStart, fileLineEnd + 1]
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

/* Reference to previous things loaded
//const [loading, updateLoading] = useState(LoadingState.Unloaded);
	//const [comments, updateComments] = useState([] as Models.Comment[]);
	//const [topic, updateTopic] = useState("");
	//const [snippet, updateSnippet] = useState(undefined as (Models.Snippet | undefined));
	//

	useEffect(() => {
		updateLoading(LoadingState.Loading);
		// TODO: fetch data (and somehow listen for new comments?)
		const result: Models.CommentThread = {
			topic: "Sample Comment thread",
			snippet: {
				fullText: [
					"b = color(77, 86, 59);",
					"c = color(42, 106, 105);",
					"d = color(165, 89, 20);",
					"e = color(146, 150, 127);"
				],
				mainLines: [1, 3],
				fileId: "24",
				fileLines: [7, 9]
			},
			comments: [
				{
					text: "Example first comment",
					author: "Pietje Puk",
					time: new Date(Date.now() - 240000)
				},
				{
					text: "Example second comment with mention to @Pietje Puk",
					author: "Peter Tester",
					time: new Date(Date.now() - 10000)
				}
			],
			visibilityLevel: 5
		};
		updateComments(result.comments);
		updateTopic(result.topic);
		updateSnippet(result.snippet);
		updateLoading(LoadingState.Loaded);
	}, []);
 */
