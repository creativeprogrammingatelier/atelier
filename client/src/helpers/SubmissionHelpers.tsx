import React from 'react';

export const submissionData = {
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

export const submissionRendering = [
    ['User', ({name} : Submission) => name],
    ['Submission', ({submissionName} : Submission) => submissionName],
    ['Date', ({date} : Submission) => date]
];

export interface Submission {
    name : string,
    userID : number,
    submissionID : number,
    submissionName : string,
    date : string
}