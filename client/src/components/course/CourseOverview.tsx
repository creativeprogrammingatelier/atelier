import React, {useEffect, useState} from 'react';
import {Frame} from '../frame/Frame';
import {DataBlockList} from '../general/DataBlockList';
import {Loading} from '../general/Loading';
import {EssentialSubmissionResponse} from '../../helpers/DatabaseResponseInterface';
import {Submission} from "../../../../models/database/Submission";
import AuthHelper from './../../../helpers/AuthHelper';

interface CourseOverviewProps {
	match: {
		params: {
			courseId: string
		}
	}
}

export function CourseOverview({match}: CourseOverviewProps) {
	const [loading, setLoading] = useState(true);
	const [submissions, setSubmissions] = useState([] as Submission[]);

	useEffect(() => {
		AuthHelper.fetch(`/api/submission/course/${match.params.courseId}`)
			.then((response) => response.json())
			.then((submissions) => {
				// TODO tags set manually here? what tags?
				setSubmissions(submissions);
				setLoading(false);
			});
	}, []);

	return (
		<Frame title="Course" user={{id: "0", name: "John Doe"}} sidebar search={"/course/../search"}>
			<h1>Course Overview</h1>
			{loading ?
				<Loading/>
				:
				<DataBlockList
					header="Submissions"
					list={submissions.map(submission => {
						console.log(submission);
						return {
							transport: `/submission/${submission.submissionID}`,
							title: submission.name == undefined ? "" : submission.name,
							text: submission.name == undefined ? "" : submission.name,
							time: submission.date == undefined ? new Date() : new Date(submission.date),
							tags : []
							//tags: submission.tags
						};
					})}
				/>
			}
		</Frame>
	);
}