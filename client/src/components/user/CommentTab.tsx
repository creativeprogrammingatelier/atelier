import React from "react";

import {Comment} from "../../../../models/api/Comment";
import {Course} from "../../../../models/api/Course";
import {User} from "../../../../models/api/User";

import {getCourseUserComments, getUserComments} from "../../../helpers/APIHelper";
import {TimeHelper} from "../../../helpers/TimeHelper";

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
						console.log("Rendering a loose comment");
						console.log(comment);
						return {
							title: comment.user.name,
							text: comment.text,
							time: TimeHelper.fromString(comment.created),
							transport: `/submission/${comment.references.submissionID}/${comment.references.fileID}/comments#${comment.references.commentThreadID}` // TODO: Link to correct /submission/:submissionId/#:commentThreadId for project-level comments
						};
					})}
				/>
			}
		/>
	</div>
}