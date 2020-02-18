import React from 'react';
import {DataTableProperties, DataTableRowMapping} from "../components/general/DataTable";

/**
 * Example of what the database query could return.
 * Provides a list of Comment objects. Use this variable if the database is not yet
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
export const commentRendering : DataTableRowMapping<Comment>[] = [
    [
        'User',
        ({name} : Comment) => name,
        ({userID} : Comment) => { return '/user?userID=' + userID}
    ],
    [
        'Submission',
        ({submissionName} : Comment) => submissionName,
        ({submissionID} : Comment) => '/submissionOverview?tab=Project'
    ],
    [
        'Line Number',
        ({startLine, endLine} : Comment) => {return `Lines: ${startLine}-${endLine}`},
        ({submissionID, startLine} : Comment) => {return '/submissionOverview?tab=Code&file=filefromcomment.java&line=' + startLine}
    ],
    ['Date', ({date} : Comment) => date]
];

/**
 * Interface for Comment
 * Name: username of author
 * UserID : user by who the submission was created
 * SubmissionID : submission to which comment belongs
 * FileID : file to which comment belongs
 * StartLine : start of comment
 * StartCharacter : start character of comment
 * EndLine : end of comment
 * EndCharacter : end character of comment
 * Date: date of comment
 */
export interface Comment {
    name : string,
    userID : number,
    submissionID : number,
    submissionName : string,
    fileID : number,
    startLine : number,
    startCharacter? : number,
    endLine : number,
    endCharacter? : number,
    date : string
}

/**
 * Interface for Comment Essential.
 * CommentName : Name of the comment
 * LastMessage : Last message in the comment thread
 * - Text: Text of the message
 * - Author: Author of the last message
 * - Time: time of the last message
 * Snippet: Snippet of the code to which this is a comment
 */
export interface CommentEssential {
    commentName : string,
    lastMessage : {
        text : string,
        author : string,
        time : string
    },
    snippet : string
}