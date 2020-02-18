import React from 'react';
import {DataTableRowMapping} from "../components/general/DataTable";
import {FileResponse} from "./DatabaseResponseInterface";
import {submissionRendering} from "./SubmissionHelpers";

/**
 * Example of what the database query could return.
 * Provides a list of Code objects. Use this variable if the database is no yet
 * functional, or to display generic code values.
 */
export const codeData = [{
        code : 'print("hello world")',
        submissionID : 12345,
        userID : 123123,
        userName : 'Pual Derksen'
    }, {
        code : 'print hello world',
        submissionID : 12345,
        userID : 123124,
        userName : 'Taric Bensen'
}];

/**
 * Rendering functions for the code entries in tables. Used by the DataTable.
 * Each array entry corresponds to a column. First entry is the column name,
 * second entry provides a function which is used to display text. The third
 * is an optional function to create a link for a certain element.
 *
 * User and code entries link to /user and /submissionOverview
 */
export const codeRendering : DataTableRowMapping<FileResponse>[] = [
    [
        'User',
        ({userName} : FileResponse) => userName,
        ({userId} : FileResponse) => {return `/user/${userId}`}
    ],
    [
        'Code',
        ({snippet} : FileResponse) => snippet,
        ({submissionId, fileId}) => `/submission/${submissionId}/code/${fileId}`
    ]
];