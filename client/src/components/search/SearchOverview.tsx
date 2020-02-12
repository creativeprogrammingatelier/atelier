import React from 'react';

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

function SubmissionTable() {
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
}

function handleSearch(value : string) {
    console.log("searching for " + value);
    return (
        <div>
            <SubmissionTable />
        </div>
    )
}

export function SearchOverview() {
    return (
        <div>
            <h1>Search Overview Page</h1>
            <SubmissionTable />
            <SearchBar
                handleSearch={handleSearch}
            />
            <hr />
            <h4>Search Result: Submissions</h4>
            <p>No submissions found</p>
            <hr />
            <h4>Search Result: Code</h4>
            <a href="/submissionOverview">Jake Walker - Bird Game - 10:00 2/12/2020</a>
            <hr />
            <h4>Search Result: Comment</h4>
            <p>No comments found</p>
            <hr />
        </div>
    )
}