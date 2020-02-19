import React, { useState, useEffect } from 'react';

import * as Models from '../../placeholdermodels';
import { LoadingState } from '../../placeholdermodels';

import { Header } from '../frame/Header';
import { Comment } from './Comment';
import { Snippet } from './Snippet';
import { WriteComment } from './WriteComment';

interface CommentThreadProperties { 
    /** The id for the CommentThread in the databaseRoutes */
    threadId: string
    // Maybe also find a way to include the topic, so it can be shown immediately
}

export function CommentThread({ threadId }: CommentThreadProperties) {
    const [loading, updateLoading] = useState(LoadingState.Unloaded);
    const [comments, updateComments] = useState([] as Models.Comment[]);
    const [topic, updateTopic] = useState("");
    const [snippet, updateSnippet] = useState(undefined as (Models.Snippet | undefined));

    useEffect(() => {
        updateLoading(LoadingState.Loading);
        // TODO: fetch data (and somehow listen for new comments?)
        const result : Models.CommentThread = {
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
                { text: "Example first comment", 
                  author: "Pietje Puk", 
                  time: new Date(Date.now() - 240000) },
                { text: "Example second comment with mention to @Pietje Puk", 
                  author: "Peter Tester", 
                  time: new Date(Date.now() - 10000) }
            ],
            visibilityLevel: 5
        };
        updateComments(result.comments);
        updateTopic(result.topic);
        updateSnippet(result.snippet);
        updateLoading(LoadingState.Loaded);
    }, []);

    // Show a newly created comment directly
    // Maybe we should let that be done over the server,
    // but this makes for a better demo
    const newComment = (text: string) => {
        updateComments(comments => [
            ...comments,
            { text, author: "Pietje Puk", time: new Date(Date.now()) }
        ]);
    };

    return (
        <div>
            <Header title={loading ? "Atelier" : topic} />
            { loading === LoadingState.Loading
              ? <main>Loading...</main>
              : <main> {/* Assuming loading is always successful, obviously */}
                  { snippet && <Snippet snippet={snippet} /> }
                  { comments.map(c => <Comment comment={c} />) }
                  <WriteComment newCommentCallback={newComment} />
                </main> }
        </div>
    );
}