import React from "react";

import {Comment} from "../../../../models/api/Comment";
import {Course} from "../../../../models/api/Course";
import {User} from "../../../../models/api/User";

import {getCourseUserComments, getUserComments} from "../../helpers/api/APIHelper";
import {TimeHelper} from "../../helpers/TimeHelper";

import {DataBlockList} from "../data/DataBlockList";
import {Loading} from "../general/loading/Loading";

interface CommentTabProperties {
	user: User,
	course?: Course
}
export function CommentTab({user, course}: CommentTabProperties) {
	return <div className="contentTab">
		<Loading<Comment[]>
			loader={course ? getCourseUserComments : getUserComments}
			params={course ? [course.ID, user.ID] : [user.ID]}
			component={comments =>
				<DataBlockList
					header="Comments"
					list={comments.map((comment: Comment) => {
						return {
							key: comment.ID,
							title: comment.user.name,
							text: comment.text,
							time: TimeHelper.fromString(comment.created),
							transport: comment.references.fileID === undefined ?
								`/submission/${comment.references.submissionID}#${comment.references.commentThreadID}`
								:
								`/submission/${comment.references.submissionID}/${comment.references.fileID}/comments#${comment.references.commentThreadID}`
						};
					})}
				/>
			}
		/>
	</div>;
}