import React from 'react';
import {Frame} from '../frame/Frame';
import {DataBlockList} from '../general/DataBlockList';
import {Loading} from '../general/Loading';
import {Submission} from "../../../../models/database/Submission";
import AuthHelper from './../../../helpers/AuthHelper';
import { Fetch } from '../../../helpers/FetchHelper';

interface CourseOverviewProps {
	match: {
		params: {
			courseId: string
		}
	}
}

export function CourseOverview({match}: CourseOverviewProps) {
    // TODO tags set manually here? what tags?
	const getSubmissions = (courseId: string) => Fetch.fetchJson<Submission[]>(`/api/submission/course/${courseId}`);

	return (
		<Frame title="Course" sidebar search={"/course/../search"}>
			<h1>Course overview</h1>
				<Loading<Submission[]>
                    loader={getSubmissions}
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