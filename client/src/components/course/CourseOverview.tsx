import React from 'react';
import {Frame} from '../frame/Frame';
import {DataBlockList} from '../general/DataBlockList';
import {Loading} from '../general/Loading';
import {Submission} from "../../../../models/database/Submission";
import { getCourseSubmissions } from '../../../helpers/APIHelper';

interface CourseOverviewProps {
	match: {
		params: {
			courseId: string
		}
	}
}

export function CourseOverview({match}: CourseOverviewProps) {
	return (
		<Frame title="Course" user={{id: "0", name: "John Doe"}} sidebar search={"/course/../search"}>
			<h1>Course overview</h1>
				<Loading<Submission[]>
                    loader={getCourseSubmissions}
                    params={[match.params.courseId]}
                    component={submissions => 
                        <DataBlockList
                            header="Submissions"
                            list={submissions.map(submission => {
                                console.log(submission);
                                return {
                                    transport: `/submission/${submission.submissionID}`,
                                    title: submission.name === undefined ? "" : submission.name,
                                    text: submission.name === undefined ? "" : submission.name,
                                    time: submission.date === undefined ? new Date() : new Date(submission.date),
                                    tags : []
                                    //tags: submission.tags
                                };
                            })}
                        />} />
		</Frame>
	);
}