import React from 'react';

import {CommentEssentials} from "./CommentEssentials";

const comments = {
  comment: [
      {
          commentName : 'comment1',
          lastMessage : {
              text : 'last message comment 1',
              author : 'author1',
              time : '9:00AM'
          },
          snippet : 'hello world'
      },
      {
          commentName: 'comment2',
          lastMessage : {
              text : 'last message comment 2',
              author : 'author2',
              time : '9:00AM'
          },
          snippet : 'print hello world'
      },
      {
          commentName: 'comment3',
          lastMessage : {
              text : 'finally',
              author : 'author3',
              time : '9:00AM'
          },
          snippet : 'print("hello world")'
      }
  ]
};

export function CommentTab() {
    return (
        <div>
            <h1>Comment Tab</h1>
            {comments.comment.map(comment => {
                return <CommentEssentials commentName={comment.commentName} lastMessage={comment.lastMessage} snippet={comment.snippet}/>
            })}
        </div>
    )
}