import React, {useState} from 'react';

import {SearchBar} from './SearchBar';
import {DataTable, DataTableProperties} from "../general/DataTable";
import {submissionData, submissionRendering} from "../../helpers/SubmissionHelpers";

function handleSearch(value : string, setResults : Function) {
    console.log("searching for " + value);

    // TODO: search
    setResults({
        submissions : {
            title : 'Submissions',
            data : submissionData.submissions,
            table : submissionRendering
        },
        codes : {
            title : 'Code',
            data : [],
            table : []
        },
        comments : {
            title : 'Comments',
            data : [],
            table : []
        }
    });
}

export function SearchOverview() {
    const [results, setResults] = useState({
        submissions : {
            title : 'Submissions',
            data : [],
            table : []
        },
        codes : {
            title : 'Code',
            data : [],
            table : []
        },
        comments : {
            title : 'Comments',
            data : [],
            table : []
        }
    });

    return (
        <div>
            <h1>Search Overview Page</h1>
            <SearchBar
                handleSearch={(value) => handleSearch(value, setResults)}
            />

            <DataTable
                title={results.submissions.title}
                data={results.submissions.data}
                table={results.submissions.table} />

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
    )
}