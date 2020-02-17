import React, {useEffect, useState} from 'react';
import {DataTable, DataTableProperties} from "../general/DataTable";
import {Submission, submissionData, submissionRendering} from "../../helpers/SubmissionHelpers";
import {Frame} from '../frame/Frame';
import {DataList} from '../general/DataList';

export function CourseOverview() {
    const [submissions, setSubmissions] = useState(null as unknown as DataTableProperties<Submission>);

    useEffect(() => {
        // TODO: fetch submissions from database for this course
        setTimeout(() => {
           setSubmissions({
               title : 'Course Submissions',
               data : submissionData,
               table : submissionRendering
           });
        }, 1000);

    }, []);

    return (
        <Frame title="Course" user={{id:"0", name:"John Doe"}} sidebar search={"/course/../search"}>
            <h1>Course Overview</h1>

            {submissions ?
                <DataTable
                    title={submissions.title}
                    data={submissions.data}
                    table={submissions.table}
                />
                    :
                <p>***Generic loading circle***</p>
                }
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