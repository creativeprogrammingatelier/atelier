import React, {useState} from "react";
import {Frame} from "../frame/Frame";
import {DataBlockList} from "../general/data/DataBlockList";
import {Loading} from "../general/loading/Loading";
import {Submission} from "../../../../models/api/Submission";
import {getCourseSubmissions} from "../../../helpers/APIHelper";
import {Uploader} from "../uploader/Uploader";
import {Jumbotron} from "react-bootstrap";

interface CourseOverviewProps {
	match: {
		params: {
			courseId: string
		}
	}
}

export function CourseOverview({match}: CourseOverviewProps) {
	const [reload, updateReload] = useState(0);

	return (
		<Frame title="Course" sidebar search={"/course/../search"}>
			<Jumbotron>
				<h1>Long Course Name Here</h1>
				<p>Created by someone?</p>
			</Jumbotron>
			<Uploader
				courseId={match.params.courseId}
				onUploadComplete={() => updateReload(rel => rel + 1)}
			/>
			<Loading<Submission[]>
				loader={getCourseSubmissions}
				params={[match.params.courseId]}
				component={submissions =>
					<DataBlockList
						header="Submissions"
						list={submissions.map(submission => {
							console.log(submission);
							return {
								transport: `/submission/${submission.ID}`,
								title: submission.name,
								text: submission.name,
								time: new Date(submission.date),
								tags: []
								//tags: submission.tags
							};
						})}
					/>
				}
			/>
		</Frame>
	);
}