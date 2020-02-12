import React, {useState} from 'react';

import {SearchBar} from './SearchBar';
import {DataTable} from "../general/DataTable";
import {submissionData, submissionRendering} from "../../helpers/SubmissionHelpers";
import {codeData, codeRendering} from "../../helpers/CodeHelpers";
import {SearchData} from "../../helpers/SearchHelpers";
import {commentData, commentRendering} from "../../helpers/CommentHelper";

/**
 * Method to handle a search.
 * @param value: value of the search field
 * @param setResults: method to set the results of the tables for code, comments and submissions.
 */
function handleSearch(value : string, setResults : Function) {
    console.log("searching for " + value);

    // TODO: search
    setResults({
        submissions : {
            title : 'Submissions',
            data : submissionData,
            table : submissionRendering
        },
        codes : {
            title : 'Code',
            data : codeData,
            table : codeRendering
        },
        comments : {
            title : 'Comments',
            data : commentData,
            table : commentRendering
        }
    });
}



export function SearchOverview() {
    const [results, setResults] = useState(null as unknown as SearchData);

    return (
        <div>
            <h1>Search Overview Page</h1>
            <SearchBar
                handleSearch={(value) => handleSearch(value, setResults)}
            />

            {
                results &&
                <div>
                    <DataTable
                        title={results.submissions.title}
                        data={results.submissions.data}
                        table={results.submissions.table}/>

                    <hr />

                    <DataTable

                        title={results.codes.title}
                        data={results.codes.data}
                        table={results.codes.table} />

                    <hr />

                    <DataTable
                        title={results.comments.title}
                        data={results.comments.data}
                        table={results.comments.table} />
                </div>
            }
        </div>
    )
}