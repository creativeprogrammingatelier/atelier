import React, {useState, useEffect} from "react";

import * as Models from "../../../placeholdermodels";
import {LoadingState} from "../../../placeholdermodels";

import {Header} from "../../frame/Header";
import {Comment as CommentComponent} from "./Comment";
import {Snippet} from "./Snippet";
import {WriteComment} from "./WriteComment";
import {ButtonBar} from "../../general/ButtonBar";
import { Button } from "react-bootstrap";
import {Loading} from "../../general/Loading";
import {FiChevronDown, FiChevronUp, FiSend} from "react-icons/all";
import {ExtendedThread} from "../../../../../models/Thread";
import {Comment} from "../../../../../models/Comment";
import AuthHelper from './../../../../helpers/AuthHelper';

interface CommentThreadProperties {
	/** The id for the CommentThread in the databaseRoutes */
	thread : ExtendedThread
	// Maybe also find a way to include the topic, so it can be shown immediately
}

export function CommentThread({thread}: CommentThreadProperties) {
	const topic : string = "We don't store topics yet so: " + thread.commentThreadID;
	const currentComments : Models.Comment[] = thread.comments
		.map((comment : Comment) => {
			return {
				text : comment.body == undefined ? "" : comment.body,
				author : comment.userID == undefined ? "" : comment.userID ,
				time : comment.date == undefined ? new Date() : comment.date
			}
		});

	const [comments, updateComments] = useState(currentComments);

	// TODO get from file body or did we want to store this?
	const DEFAULT_FULL_TEXT = ["no full", "text yet", "did we want to", "get this from the database", "or manually parse from file?", "parsing from file requires additional (not really needed)", "fetches"];
	// TODO get proper snippet with text etc. Can this be undefined as currently in the database?
	const snippet : Models.Snippet = {
		fullText : DEFAULT_FULL_TEXT,
		mainLines : [0, Math.min(2, DEFAULT_FULL_TEXT.length)],
		fileId : "00000000-0000-0000-0000-000000000000",
		fileLines : [0, 0]
	};

	console.log(comments);
	console.log(snippet);



	// In case we still need fetching after?
	const [loading, updateLoading] = useState(LoadingState.Loaded);
	const [opened, setOpened] = useState(false);



	// Show a newly created comment directly
	// Maybe we should let that be done over the server,
	// but this makes for a better demo
	// TODO pass token instead of userID
	const newComment = (text: string) => {
		AuthHelper.fetch(`/api/comment/${thread.commentThreadID}`, {
			method : 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body : JSON.stringify({
				userID : "00000000-0000-0000-0000-000000000000",
				body : text
			})
		})
			.then((data : any) => data.json())
			.then((response : Comment) => {
				console.log(response);
				updateComments((comments : any) => [
					...comments,
					{text : response.body, author : response.userID, time : response.date}
				]);
			});
		/*updateComments((comments : any) => [
			...comments,
			{text, author: "Pietje Puk", time: new Date(Date.now())}
		]);*/
	};

	return (
		<div className="commentThread">
			<h3 className="m-0 px-2 py-1">{loading === LoadingState.Loading ? "Atelier" : topic}</h3>
			{loading === LoadingState.Loading
				? <Loading/>
				: <div> {/* Assuming loading is always successful, obviously */}
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
			}
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
