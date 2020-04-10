import React from "react";

import {Comment} from "../../../../models/api/Comment";

interface CommentProperties {
    comment: Comment
}

export function Comment({comment}: CommentProperties) {
    return (
        <div className="comment px-2 py-1">
            <small><span>{comment.user.name}</span> at <span>{(new Date(comment.created)).toLocaleString()}</span></small>
            <div>{comment.text}</div>
        </div>
    );
}