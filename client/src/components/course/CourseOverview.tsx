import React from 'react';
import {DataTable} from "../general/DataTable";
import {submissionData, submissionRendering} from "../../helpers/SubmissionHelpers";
import {Frame} from '../frame/Frame';

const submissions = {
    title: 'Course Submissions',
    data: submissionData.submissions,
    table: submissionRendering
};

export function CourseOverview() {
    return (
        <Frame title="Course" user="John Doe" sidebar={true} search={true}>
            <h1>Course Overview</h1>
            <DataTable
                title={submissions.title}
                data={submissions.data}
                table={submissions.table}
            />
        </Frame>
    )
}