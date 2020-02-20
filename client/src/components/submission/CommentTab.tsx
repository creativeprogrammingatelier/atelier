import React from "react";

import {CommentEssentials} from "./CommentEssentials";
import {CommentThread} from "./comment/CommentThread";

// TODO this should be retrieved from the databaseRoutes
const comments = {
	comment: [
		{
			commentName: "Generic Comment Name 1",
			lastMessage: {
				text: "perhaps try calling the print function",
				author: "Klaas",
				time: "9:00AM"
			},
			snippet: "hello world"
		},
		{
			commentName: "Generic Comment Name 2",
			lastMessage: {
				text: "python3 requires the () for calling the print function :(",
				author: "Klaas",
				time: "10:00AM"
			},
			snippet: "print hello world"
		},
		{
			commentName: "Generic Comment Name 3",
			lastMessage: {
				text: "finally",
				author: "Klaas",
				time: "3:00PM"
			},
			snippet: "print(\"hello world\")"
		}
	]
};

interface CommentTabProperties {
	fileName: string,
	threads: string[]
}
export function CommentTab({fileName, threads}: CommentTabProperties) {
	return (
		<div>
			<h1>{fileName}</h1>
			{threads.map((thread) => <CommentThread threadId={thread}/>)}
		</div>
	);
}