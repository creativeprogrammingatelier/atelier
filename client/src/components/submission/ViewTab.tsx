import React from "react";
import {File} from "../../../../models/api/File";
import {Children} from "../../helpers/ParentHelper";
import {Selection} from "../../../../models/api/Snippet";
import {ThreadState} from "../../../../models/enums/ThreadStateEnum";
import {FileCommentHandler, FileViewerProperties} from "./FileOverview";
import { useFileComments } from "../../helpers/api/APIHooks";

interface ViewTabProperties {
	file: File,
	viewer: (properties: FileViewerProperties) => Children,
}
export function ViewTab({file, viewer}: ViewTabProperties) {
    const fileComments = useFileComments(file.references.submissionID, file.ID);

	const sendComment: FileCommentHandler = (comment: string, restricted: boolean, selection?: Selection | undefined) => {
		return fileComments.create({
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