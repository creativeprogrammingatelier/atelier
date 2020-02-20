import React from "react";
import {CommentEssential} from "../../helpers/DatabaseResponseInterface";
import {Link} from "react-router-dom";
import {Comment} from "./comment/Comment";
import {CommentThread} from "./comment/CommentThread";
import {MentionSuggestions} from "./comment/MentionSuggestions";
import {Snippet} from "./comment/Snippet";
import {WriteComment} from "./comment/WriteComment";
//import {CommentEssential} from "../../helpers/CommentHelper";

export function CommentEssentials({commentName, lastMessage, snippet}: CommentEssential) {
	function commentCallback(comment: string) {
		console.log("The callback was called back!");
		console.log(comment);
	}

	return (
		<div className="CommentEssential">
			<hr/>
			<h3>{commentName}</h3>
			<p>Snippet: {snippet}</p>
			<p>Last comment:</p>
			<ul>
				<li>{lastMessage.text}</li>
				<li>Author: {lastMessage.author}</li>
				<li>Time: {lastMessage.time}</li>
				<li>[CSS is putting me on the same line]</li>
			</ul>
			<Link to='/commentThread'>View comment thread</Link>
		</div>
	);
}