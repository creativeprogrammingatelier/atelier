import React from "react";

import {File} from "../../../../models/api/File";
import {Selection} from "../../../../models/api/Snippet";
import {ThreadState} from "../../../../models/enums/ThreadStateEnum";

import {useFileComments} from "../../helpers/api/APIHooks";

import {FileCommentHandler, FileViewerProperties} from "./FileOverview";

interface ViewTabProperties {
	file: File,
	viewer: (properties: FileViewerProperties) => JSX.Element,
}
export function ViewTab({file, viewer: viewer}: ViewTabProperties) {
	const fileComments = useFileComments(file.references.submissionID, file.ID);
	
	const sendComment: FileCommentHandler = (comment: string, restricted: boolean, selection?: Selection | undefined) => {
		return fileComments.create({
			submissionID: file.references.submissionID,
			comment,
			snippet: selection,
			visibility: restricted ? ThreadState.private : ThreadState.public
		})
			.then(() => true)
			.catch(err => {
				// TODO: handle error
				console.log(err);
				return false;
			});
	};
	
	return <div className="contentTab">
		<div className="m-3">
			{viewer({file, sendComment})}
		</div>
	</div>;
}