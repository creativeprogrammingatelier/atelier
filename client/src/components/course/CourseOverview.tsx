import React, {useEffect, useState} from 'react';
import {DataTable, DataTableProperties} from "../general/DataTable";
import {Submission, submissionData, submissionRendering} from "../../helpers/SubmissionHelpers";



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
        <div>
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
        </div>
    )
}