import React, { useState, useEffect } from 'react';
import { DataTable } from '../general/DataTable';
import {Frame} from '../frame/Frame';
import {
    CommentThreadResponse,
    SubmissionResponse,
    UserResponse
} from "../../helpers/DatabaseResponseInterface";
import {Loading} from "../general/Loading";


export function UserOverview() {
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState(null as unknown as SubmissionResponse[]);
    const [user, setUser] = useState(null as unknown as UserResponse);
    const [comments, setComments] = useState(null as unknown as CommentThreadResponse[]);

    const userID = "00000000-0000-0000-0000-000000000000";
    // TODO pass token here as well to the API?

    useEffect(() => {
       fetch(`/api/user/${userID}/submissions`)
           .then(response => response.json())
           .then(data => {
               console.log(data);
              //setSubmissions(data.submissions);
              //setUser(data.user);
              //setComments(data.commentThreads);
              setLoading(false);
           });
    }, []);

    return (
        <div>
        { loading ?
                <Loading />
                :
                <Frame
                    title={user.name}
                    user={{id: `${user.userId}`, name: user.name}}
                    sidebar search={`/user/${user.userId}/search`}
                >
                    <DataTable
                        title="To be reviewed"
                        data={submissions}
                        table={[
                            ["Project", x => x.name, x => `/submission/${x.submissionId}`],
                            ["Date", x => new Date(x.date).toLocaleString()]
                        ]}/>
                    <DataTable
                        title="Projects"
                        data={submissions}
                        table={[
                            ["Project", x => x.name, x => `/submission/${x.submissionId}`],
                            ["Date", x => new Date(x.date).toLocaleString()]
                        ]}/>
                    <DataTable
                        title="Comments"
                        data={comments}
                        table={[
                            ["Topic", x => x.name],
                            ["Last author", x => x.comments.slice(-1)[0].author, x => `/user/${x.comments.slice(-1)[0].userId}`],
                            ["Last reply", x => x.comments.slice(-1)[0].text]
                        ]}/>
                </Frame>
        }
        </div>
    );
}