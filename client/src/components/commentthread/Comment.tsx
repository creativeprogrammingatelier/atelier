import React from 'react';

import { Comment } from '../../placeholdermodels';

interface CommentProperties { 
    comment: Comment 
}

export function Comment({ comment }: CommentProperties) {
        return (
        <div style={{ border: "1px solid #000", borderRadius: "4px", margin: "4px" }}>
            <span>{comment.author}</span> at <span>{comment.time.toLocaleString()}</span>
            <div>{comment.text}</div>
        </div>
    );
}