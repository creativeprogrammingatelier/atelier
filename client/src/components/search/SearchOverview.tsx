import React from 'react';

import {SearchBar} from './SearchBar';

// title
// data = []
//

/*const SubmissionData = {
    title : 'Submissions',
    data : [
        'Jake Walker',
    ]
};*/


function handleSearch(value : string) {
    console.log("searching for " + value);
}

export function SearchOverview() {
    return (
        <div>
            <h1>Search Overview Page</h1>
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