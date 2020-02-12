import React from 'react';
import {DataTable} from "../general/DataTable";
import {submissionData, submissionRendering} from "../../helpers/SubmissionHelpers";

const submissions = {
    title : 'Course Submissions',
    data : submissionData.submissions,
    table : submissionRendering
};

export function CourseOverview() {
    return (
        <div>
            <h1>Course Overview</h1>
            <DataTable
                title={submissions.title}
                data={submissions.data}
                table={submissions.table} />
        </div>
    )
}