import React from 'react';
import {DataTableProperties, DataTableRowMapping} from "../components/general/DataTable";
import {SubmissionResponse} from "./DatabaseResponseInterface";

/**
 * Example of what the databaseRoutes query could return.
 * Provides a list of Submission objects. Use this variable if the databaseRoutes is not yet
 * functional, or to display generic submission values.
 */
export const submissionData = [{
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
}];

/**
 * Rendering function for submission entries in tables. Used by the DataTable.
 * Each array entry corresponds to a column. First entry is the column name.
 * Second entry provides a function which is used to display text.
 * Third entry is an optional function to create a link for a certain element.
 *
 * User and submission entries link to /user and /submissionOverview.
 */
export const submissionRendering : Array<DataTableRowMapping<SubmissionResponse>> = [
    [
        'User',
        ({user} : SubmissionResponse) => user,
        ({userId} : SubmissionResponse) => `/user/${userId}`],
    [
        'Submission',
        ({name, submissionId} : SubmissionResponse) => name,
        ({submissionId} : SubmissionResponse) => `/submission/${submissionId}`
    ],
    ['Date', ({date} : SubmissionResponse) => new Date(date).toLocaleString()]
];