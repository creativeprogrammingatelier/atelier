import React, { useState, useEffect } from 'react';

import * as Models from '../../placeholdermodels';
import { LoadingState } from '../../placeholdermodels';

import { Header } from '../general/Header';
import { DataTable } from '../general/DataTable';
import { Model } from 'mongoose';

interface UserOverviewProperties {
    userId: string
}

export function UserOverview({ userId }: UserOverviewProperties) {
    const [loading, updateLoading] = useState(LoadingState.Unloaded);
    const [user, updateUser] = useState(null as Models.User);
    const [submissions, updateSubmissions] = useState([] as Models.Submission[]);
    const [commentThreads, updateCommentThreads] = useState([] as Models.CommentThread[]);

    useEffect(() => {
        updateLoading(LoadingState.Loading);
        // TODO: fetch data (and somehow listen for new comments?)
        const user : Models.User = {
            id: "35",
            name: "Pieter Post"
        };
        const submissions : Models.Submission[] = [
            { id: "72",
              name: "TestProject",
              date: new Date(Date.now() - 24*60*60*1000) },
            { id: "94",
              name: "Dingetje",
              date: new Date(Date.now() - 48*60*59*999) }
        ];
        const commentThreads : Models.CommentThread[] = [
            { topic: "Sample Comment thread",
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
                    author: "Pieter Post", 
                    time: new Date(Date.now() - 240000) },
                  { text: "Example second comment with mention to @Pietje Puk", 
                    author: "Pieter Post", 
                    time: new Date(Date.now() - 10000) }
              ],
              visibilityLevel: 5 },
            { topic: "Another comment",
              snippet: null,
              comments: [
                  { text: "Just some comment on this code", 
                    author: "Pieter Post",
                    time: new Date(Date.now() - 360000) }
              ],
              visibilityLevel: 3 }
        ]
        updateUser(user);
        updateSubmissions(submissions);
        updateCommentThreads(commentThreads);
        updateLoading(LoadingState.Loaded);
    }, []);

    return (
        <div>
            <Header title={loading === LoadingState.Loaded ? user.name : "Atelier"}/>
            <DataTable
                title="To be reviewed"
                data={submissions}
                table={[
                    ["Project", x => x.name], 
                    ["Date", x => x.date.toLocaleString()]
                ]}
                link={_ => "/submissionOverview"} />
            <DataTable 
                title="Projects" 
                data={submissions} 
                table={[
                    ["Project", x => x.name], 
                    ["Date", x => x.date.toLocaleString()]
                ]}
                link={_ => "/submissionOverview"} />
            <DataTable 
                title="Comments" 
                data={commentThreads} 
                table={[
                    ["Topic", x => x.topic],
                    ["Last reply", x => { 
                        const last = x.comments.slice(-1)[0];
                        return <span><span>{last.author}</span>: {last.text}</span>
                    }]
                ]}
                link={_ => "/commentThread"} />
        </div>
    );
}