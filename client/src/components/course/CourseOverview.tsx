import React from 'react';
import {Frame} from '../frame/Frame';
import {DataBlockList} from '../general/DataBlockList';
import {Loading} from '../general/Loading';
import AuthHelper from './../../../helpers/AuthHelper';
import { Submission } from '../../../../models/Submission';

interface CourseOverviewProps {
	match: {
		params: {
			courseId: string
		}
	}
}

export function CourseOverview({match}: CourseOverviewProps) {
	const getSubmissions = () =>
		AuthHelper.fetch(`/api/submissions/course/${match.params.courseId}`)
			.then((response) => response.json());
            // TODO tags set manually here? what tags?

	return (
		<Frame title="Course" user={{id: "0", name: "John Doe"}} sidebar search={"/course/../search"}>
			<h1>Course Overview</h1>
				<Loading<Submission[]>
                    loader={getSubmissions}
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