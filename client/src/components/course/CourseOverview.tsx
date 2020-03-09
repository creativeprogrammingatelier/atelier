import React, {useState, Fragment} from "react";
import {Frame} from "../frame/Frame";
import {DataBlockList} from "../general/data/DataBlockList";
import {Loading} from "../general/loading/Loading";
import {Submission} from "../../../../models/api/Submission";
import {getCourse, getCourseSubmissions} from "../../../helpers/APIHelper";
import {Uploader} from "../uploader/Uploader";
import {Jumbotron} from "react-bootstrap";
import {Course} from "../../../../models/api/Course";

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
				<Loading<Course>
					loader={getCourse}
					params={[match.params.courseId]}
					component={course => <Fragment><h1>{course.name}</h1><p>Created by {course.creator.name}</p></Fragment>}
				/>
			</Jumbotron>
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
			<div className="m-3">
				<Uploader
					courseId={match.params.courseId}
					onUploadComplete={() => updateReload(rel => rel + 1)}
				/>
			</div>
		</Frame>
	);
}