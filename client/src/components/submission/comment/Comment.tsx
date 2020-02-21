import React from "react";

import {Comment} from "../../../placeholdermodels";

interface CommentProperties {
	comment: Comment
}

export function Comment({comment}: CommentProperties) {
	return (
		<div className="comment px-2 py-1">
			<small><span>{comment.author}</span> at <span>{comment.time.toLocaleString()}</span></small>
			<div>{comment.text}</div>
		</div>
	);
}