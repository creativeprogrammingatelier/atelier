import React, { Fragment } from "react";
import {User} from "../../../../models/api/User";
import {DataList} from "../data/DataList";
import {Loading} from "../general/loading/Loading";
import {Course} from "../../../../models/api/Course";
import {getCourseUserComments, getUserComments, getUserCourses} from "../../../helpers/APIHelper";
import {PanelButton} from "../general/PanelButton";
import {Comment} from "../../../../models/api/Comment";
import {DataItem} from "../data/DataItem";
import {DataBlock} from "../data/DataBlock";
import {DataBlockList} from "../data/DataBlockList";
import {TimeHelper} from "../../../helpers/TimeHelper";

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
							title: comment.user.name,
							text: comment.text,
							time: TimeHelper.fromString(comment.created),
							transport: "" // TODO: Link to correct /submission/:submissionId/:fileId/comments#:commentThreadId
						};
					})}
				/>
			}
		/>
	</div>
}