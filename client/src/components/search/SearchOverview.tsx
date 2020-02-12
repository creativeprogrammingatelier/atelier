import React, {useState} from 'react';

import {SearchBar} from './SearchBar';
import {DataTable, DataTableProperties} from "../general/DataTable";


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

/*interface Submission {
    userID : number,
    name : string,
    submissionID : number,
    submissionName : string,
    date: string
}*/

function handleSearch(value : string, setResults : Function) {
    console.log("searching for " + value);

    // TODO: search
    setResults({
        submissions : submissionData.submissions,
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

    console.log(results.submissions.title);
    console.log(results.submissions.data);
    console.log(results.submissions.table);

    console.log(results.codes.title);
    console.log(results.codes.data);
    console.log(results.codes.table);

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