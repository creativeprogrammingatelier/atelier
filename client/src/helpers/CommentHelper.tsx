import React from 'react';
import {DataTableRowMapping} from "../components/general/DataTable";

/**
 * Example of what the databaseRoutes query could return.
 * Provides a list of Comment objects. Use this variable if the databaseRoutes is not yet
 * functional, or to display generic comment values.
 */
export const commentData = [{
    name : 'Jan Willem',
    userID : 123,
    submissionID : 123,
    submissionName : 'Bird project',
    fileID : 123,
    startLine : 3,
    startCharacter : 4,
    endLine : 4,
    endCharacter : 5,
    date : '2/12/2020'
}, {
    name : 'Dhr. Polderman',
    userID : 123,
    submissionID : 123,
    submissionName: 'Design Project',
    fileID : 123,
    startLine : 3,
    startCharacter : 4,
    endLine : 4,
    endCharacter : 5,
    date : '2/12/2020'
}];

/**
 * Rendering function for comment entries in tables. Used by the DataTable.
 * Each array entry corresponds to a column. First entry is the column name.
 * Second entry provides a function which is used to display text.
 * Third entry is an optional function to create a link for a certain element.
 *
 * User and submission go to /user and /submissionOverview
 */
// export const commentRendering : DataTableRowMapping<CommentResponse>[] = [
//     [
//         'User',
//         ({author} : CommentResponse) => author,
//         ({userId} : CommentResponse) => { return `/user/${userId}`}
//     ],
//     [
//         'Submission',
//         ({submissionName }: CommentResponse) => submissionName,
//         ({submissionId} : CommentResponse) => `/submission/${submissionId}`
//     ],
//     [
//         'Line Number',
//         ({startLine, endLine} : CommentResponse) => {return `Lines: ${startLine}-${endLine}`},
//         ({submissionId, fileId,startLine} : CommentResponse) => {return `/submission/${submissionId}/code/${fileId}#${startLine}`}
//     ]
// ];