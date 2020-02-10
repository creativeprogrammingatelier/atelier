import React from 'react';

interface CommentEssential {
        commentName : string,
        lastMessage : {
            author : string,
            time : string
        },
        snippet : string

}

export function CommentEssentials({commentName,lastMessage, snippet} : CommentEssential) {
    return (
        <div className="CommentEssential">
            <h3>{commentName}</h3>
            <p>Snippet: {snippet}</p>
            <p>Last comment:</p>
            <ul>
                <li>Author: {lastMessage.author}</li>
                <li>Time: {lastMessage.time}</li>
                <li>[CSS is putting me on the same line]</li>
            </ul>
        </div>
    )
}