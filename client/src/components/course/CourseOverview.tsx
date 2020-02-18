import React, {useEffect, useState} from 'react';
import {DataTable} from "../general/DataTable";
import {submissionData, submissionRendering} from "../../helpers/SubmissionHelpers";
import {Frame} from '../frame/Frame';
import {DataList} from '../general/DataList';
import {Loading} from "../general/Loading";
import {EssentialSubmissionResponse} from "../../helpers/DatabaseResponseInterface";

interface CourseOverviewProps {
	courseId : number
}

export function CourseOverview({courseId} : CourseOverviewProps) {
	const [loading, setLoading] = useState(true);
	const [submissions, setSubmissions] = useState(null as unknown as EssentialSubmissionResponse[]);

	useEffect(() => {
		fetch(`/api/course/${courseId}/submissions`)
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				setSubmissions(data.submissions);
				setLoading(false);
			});
	}, []);

	return (
		<Frame title="Course" user={{id:"0", name:"John Doe"}} sidebar search={"/course/../search"}>
			<h1>Course Overview</h1>
			{
				loading ?
					<Loading />
					:
					<DataList
						header="Submissions"
						list = {submissions.map(submission => {
							return {
								title : submission.user,
								text : submission.name,
								time : new Date(submission.time),
								tags : submission.tags
							}
						})}
					/>
			}
		</Frame>
	)
}