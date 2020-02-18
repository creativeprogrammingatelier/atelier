import React from 'react';
import {Submission} from "./SubmissionHelpers";
import {DataTableRowMapping} from "../components/general/DataTable";
import {Code} from "./CodeHelpers";
import {Comment} from "./CommentHelper"

export interface SearchData {
    submissions : {
        title : string,
        data : Submission[],
        table : DataTableRowMapping<Submission>[]
    },
    codes : {
        title : string,
        data : Code[],
        table : DataTableRowMapping<Code>[]
    },
    comments : {
        title : string,
        data : Comment[],
        table : DataTableRowMapping<Comment>[]
    }
}