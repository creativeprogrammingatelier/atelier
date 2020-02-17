import React from 'react';
import {DataTable} from "../general/DataTable";
import {submissionData, submissionRendering} from "../../helpers/SubmissionHelpers";
import {Frame} from '../frame/Frame';
import {DataList} from '../general/DataList';

const submissions = {
    title: 'Course Submissions',
    data: submissionData.submissions,
    table: submissionRendering
};

export function CourseOverview() {
    return (
        <Frame title="Course" user={{id:"0", name:"John Doe"}} sidebar search={"/course/../search"}>
            <h1>Course Overview</h1>
            {/*<DataTable*/}
            {/*    title={submissions.title}*/}
            {/*    data={submissions.data}*/}
            {/*    table={submissions.table}*/}
            {/*/>*/}
            <DataList header="Submissions" list={[
                {
                    title: "John Doe",
                    text: "Uploaded helpitbroke.zip",
                    time: "42 minutes ago",
                    tags: [{name:"help", color:"red"}, {name:"me", color:"red"}, {name:"now", color:"red"}]
                }
            ]}/>
        </Frame>
    )
}