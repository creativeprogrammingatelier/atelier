import React from "react";
import {User} from "../../../../models/api/User";
import {Jumbotron} from "react-bootstrap";
import {Loading} from "../general/loading/Loading";
import {Submission} from "../../../../models/api/Submission";
import {getCourseSubmissions, getCourseUserSubmissions, getUserSubmissions} from "../../../helpers/APIHelper";
import {DataBlockList} from "../general/data/DataBlockList";
import {Frame} from "../frame/Frame";
import {TimeHelper} from "../../../helpers/TimeHelper";
import { Course } from "../../../../models/api/Course";

interface SubmissionTabProperties {
	user: User,
	course?: Course
}
export function SubmissionTab({user, course}: SubmissionTabProperties) {
	return <div className="contentTab">
		<Loading<Submission[]>
			loader={course ? getCourseUserSubmissions : getUserSubmissions}
			params={course ? [course.ID, user.ID] : [user.ID]}
			component={submissions =>
				<DataBlockList
					header="Submissions"
					list={submissions.map(submission => {
						return {
							transport: `/submission/${submission.ID}`,
							title: submission.name,
							text: submission.name,
							time: TimeHelper.fromString(submission.date)
						};
					})}
				/>
			}
		/>
	</div>
}