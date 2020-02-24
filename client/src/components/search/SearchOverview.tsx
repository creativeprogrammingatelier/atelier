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
/**
 * Method to handle a search.
 * @param value: value of the search field
 * @param setResults: method to set the results of the tables for code, comments and submissions.
 * @param setLoading: method to set loading variable for visual feedback
 */
function handleSearch(value : string, setResults : Function, setLoading : Function) {
    console.log("searching for " + value);
    setLoading(true);
    AuthHelper.fetch(`/api/search?q=${value}`)
    .then(response => {console.log(response); return response})
    .then(response => response.json)
        .then(data => {
            setResults({
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
            });
            setLoading(false);
        });
}

export function SearchOverview() {
    const [results, setResults] = useState(null as unknown as SearchData);
    const [loading, setLoading] = useState(false);

    return (
        <Frame title="Search" user={{id:"1", name:"John Doe"}} sidebar>
            <h1>Search Overview Page</h1>
            <SearchBar
                handleSearch={(value) => handleSearch(value, setResults, setLoading)}
            />

            {
                results != null ?
                    <div>
                        {loading ?
                            <Loading/>
                            :
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
                            </div>
                        }
                    </div>
                    :
                    <div></div>
            }
        </Frame>
    )
}