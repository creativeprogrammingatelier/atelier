import React from "react";
import {File} from "../../../../models/api/File";
import {Children} from "../../helpers/ParentHelper";
import {Selection} from "../../../../models/api/Snippet";
import {threadState} from "../../../../models/enums/threadStateEnum";
import {FileCommentHandler, FileViewerProperties} from "./FileOverview";
import { useFileComments } from "../../helpers/api/APIHooks";

interface ViewTabProperties {
	file: File,
	viewer: (properties: FileViewerProperties) => Children,
}
export function ViewTab({file, viewer}: ViewTabProperties) {
    const {createFileComment} = useFileComments(file.references.submissionID, file.ID);

	const sendComment: FileCommentHandler = (comment: string, restricted: boolean, selection?: Selection | undefined) => {
		return createFileComment({
			submissionID: file.references.submissionID,
			comment,
			snippet: selection,
			visibility: restricted ? threadState.private : threadState.public
		});
	};
	
	return <div className="contentTab">
		<div className="m-3">
			{viewer({file, sendComment})}
		</div>
	</div>
}