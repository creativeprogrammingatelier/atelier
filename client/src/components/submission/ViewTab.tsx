import React from "react";
import {createFileCommentThread} from "../../../helpers/APIHelper";
import {File} from "../../../../models/api/File";
import {Children} from "../../helpers/ParentHelper";
import {Selection} from "../../../../models/api/Snippet";
import {ThreadState} from "../../../../models/enums/threadStateEnum";
import {FileCommentHandler, FileViewerProperties} from "./FileOverview";

interface ViewTabProperties {
	file: File,
	viewer: (properties: FileViewerProperties) => Children,
}
export function ViewTab({file, viewer}: ViewTabProperties) {
	const sendComment: FileCommentHandler = (comment: string, restricted: boolean, selection?: Selection | undefined) => {
		return createFileCommentThread(file.ID, {
			submissionID: file.references.submissionID,
			comment,
			snippet: selection,
			visibility: restricted ? ThreadState.private : ThreadState.public
		});
	};
	
	return <div className="contentTab">
		<div className="m-3">
			{viewer({file, sendComment})}
		</div>
	</div>
}