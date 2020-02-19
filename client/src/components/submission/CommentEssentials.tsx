import React from 'react';
import {CommentEssential} from "../../helpers/CommentHelper";

export function CommentEssentials({commentName,lastMessage, snippet} : CommentEssential) {
    return (
        <div className="CommentEssential">
            <h3>{commentName}</h3>
            <p>Snippet: {snippet}</p>
            <p>Last comment:</p>
            <ul>
                <li>{lastMessage.text}</li>
                <li>Author: {lastMessage.author}</li>
                <li>Time: {lastMessage.time}</li>
                <li>[CSS is putting me on the same line]</li>
            </ul>
            <a href='/commentThread'>View comment thread</a>
        </div>
    )
}