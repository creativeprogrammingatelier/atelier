import React from "react";

import {File} from "../../../../models/api/File";
import {ServerError} from "../../../../models/api/ServerError";
import {Selection} from "../../../../models/api/Snippet";
import {ThreadState} from "../../../../models/enums/ThreadStateEnum";

import {useFileComments} from "../../helpers/api/APIHooks";
import {FeedbackMessage} from "../feedback/Feedback";

import {FileCommentHandler, FileViewerProperties} from "./FileOverview";

interface ViewTabProperties {
	file: File,
	viewer: (properties: FileViewerProperties) => JSX.Element,
}
export function ViewTab({file, viewer: viewer}: ViewTabProperties) {
	const fileComments = useFileComments(file.references.submissionID, file.ID);
	
	const sendComment: FileCommentHandler = (comment: string, restricted: boolean, selection?: Selection | undefined) => {
		const commentText = comment.trim();
		if (commentText === "") {
			// Should the user get an error message when sending an empty comment? or would they understand?
			return Promise.resolve(new FeedbackMessage("error", false));
		}
		return fileComments.create({
			submissionID: file.references.submissionID,
			comment,
			snippet: selection,
			visibility: restricted ? ThreadState.private : ThreadState.public
		})
			.then(() => new FeedbackMessage("success", "Comment created successfully"))
			.catch((error: ServerError) => {
				return new FeedbackMessage("error", error.message);
			});
	};
	
	return <div className="contentTab">
		<div className="m-3">
			{viewer({file, sendComment})}
		</div>
	</div>;
}