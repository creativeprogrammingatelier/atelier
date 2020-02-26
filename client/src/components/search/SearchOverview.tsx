import React, {useState} from 'react';

import {SearchBar} from './SearchBar';
import {DataTable} from "../general/DataTable";
import {submissionData, submissionRendering} from "../../helpers/SubmissionHelpers";
import {codeData, codeRendering} from "../../helpers/CodeHelpers";
import {commentData, commentRendering} from "../../helpers/CommentHelper";
import {Frame} from '../frame/Frame';
import {Loading} from "../general/Loading";
import {
    CommentResponse,
    FileResponse,
    SearchResponse,
    SubmissionResponse
} from "../../helpers/DatabaseResponseInterface";
import AuthHelper from '../../../helpers/AuthHelper';
import { Fetch } from '../../../helpers/FetchHelper';


interface SearchData {
    submissions : {
        title : string,
        data : SubmissionResponse[],
        table : any
    },
    codes : {
        title : string,
        data : FileResponse[],
        table : any
    },
    comments : {
        title : string,
        data : CommentResponse[],
        table : any
    }
}

export function SearchOverview() {
    const [searchTerm, updateSearchTerm] = useState("");

    const getResults = (term: string): Promise<SearchData> =>
        // TODO: find correct type
        Fetch.fetchJson<any>(`/api/search?q=${term}`)
            .then(data => ({
                   submissions : {
                       title : 'Submissions',
                       data : data.submissions,
                       table : submissionRendering
                   },
                   codes : {
                       title : 'Code',
                       data : data.files,
                       table : codeRendering
                   },
                   comments : {
                       title : 'Comments',
                       data : data.comments,
                       table : commentRendering
                   }
                }));

    return (
        <Frame title="Search" user={{id:"1", name:"John Doe"}} sidebar>
            <h1>Search Overview Page</h1>
            <SearchBar handleSearch={updateSearchTerm} />
            <Loading<SearchData>
                loader={getResults}
                params={[searchTerm]}
                component={results =>
                    <div>
                        <DataTable
                            title={results.submissions.title}
                            data={results.submissions.data}
                            table={results.submissions.table}/>

                        <hr/>

                        <DataTable
                            title={results.codes.title}
                            data={results.codes.data}
                            table={results.codes.table}/>

                        <hr/>

                        <DataTable
                            title={results.comments.title}
                            data={results.comments.data}
                            table={results.comments.table}/>
                    </div>} />
        </Frame>
    )
}