import React from "react";

import {Course} from "../../../../models/api/Course";
import {Submission} from "../../../../models/api/Submission";
import {User} from "../../../../models/api/User";

import {getCourseUserSubmissions, getUserSubmissions} from "../../helpers/api/APIHelper";
import {TimeHelper} from "../../helpers/TimeHelper"
	;
import {DataBlockList} from "../data/DataBlockList";
import {Loading} from "../general/loading/Loading";

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
							key: submission.ID,
							transport: `/submission/${submission.ID}`,
							title: submission.name,
							text: submission.name,
							time: TimeHelper.fromString(submission.date)
						};
					})}
				/>
			}
		/>
	</div>;
}