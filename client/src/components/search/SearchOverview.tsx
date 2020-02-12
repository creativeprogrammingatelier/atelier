import React, {useEffect, useState} from 'react';

import {SearchBar} from './SearchBar';
import {Link} from "react-router-dom";
import {DataTable, DataTableProperties} from "../general/DataTable";

// title
// data = []
//

const submissionData = {
    submissions : [{
        userID : 123,
        name : 'Jake Walker',
        submissionID : 123455,
        submissionName : 'Bird Project',
        date : '2/12/2020'
    }, {
        userID : 124,
        name : 'William Shakespeare',
        submissionID: 123456,
        submissionName: 'Design Bird',
        date : '1/12/2020'
    }]
};

interface Submission {
    userID : number,
    name : string,
    submissionID : number,
    submissionName : string,
    date: string
}

/*function SubmissionTable() {
    console.log("getting submission table");
    // TODO make database query for submission data
    const submissionResult = submissionData;

    const submissionTable : DataTableProperties<Submission> = {
        title: 'Submissions',
        data : submissionResult.submissions,
        table : [
            ['User', ({name}: Submission) => name],
            ['Submission', ({submissionName} : Submission) => submissionName],
            ['Date', ({date} : Submission) => date]
        ]
    };

    console.log(submissionTable);

    return DataTable<Submission>(submissionTable)
}*/

function handleSearch(value : string, setResults : Function) {
    console.log("searching for " + value);

    // TODO: search
    setResults({
        'submission' : submissionData,
        'code' : {
            title : 'Code',
            data : [],
            table : []
        },
        'comments' : {
            title : 'Comments',
            data : [],
            table : []
        }
    });
}

export function SearchOverview() {
    const [results, setResults] = useState({
        'submission' : {
            title : 'Submissions',
            data : [],
            table : []
        },
        'code' : {
            title : 'Code',
            data : [],
            table : []
        },
        'comments' : {
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
                title={results.submission.title}
                data={results.submission.data}
                table={results.submission.table} />

            <hr />

            <DataTable
                title={results.code.title}
                data={results.code.data}
                table={results.code.table} />

            <hr />

            <DataTable
                title={results.comments.title}
                data={results.comments.data}
                table={results.comments.table} />
        </div>
    )
}