import React from "react";
import {File} from "../../../../models/api/File";
import {Children} from "../../helpers/ParentHelper";
import {Selection} from "../../../../models/api/Snippet";
import {ThreadState} from "../../../../models/enums/ThreadStateEnum";
import {FileCommentHandler, FileViewerProperties} from "./FileOverview";
import { useFileComments } from "../../helpers/api/APIHooks";

interface ViewTabProperties {
	file: File,
	viewer: (properties: FileViewerProperties) => JSX.Element,
}

// We have to handle this as a React element, so its name has to be PascalCase
// tslint:disable-next-line: variable-name
export function ViewTab({file, viewer: Viewer}: ViewTabProperties) {
    const fileComments = useFileComments(file.references.submissionID, file.ID);

	const sendComment: FileCommentHandler = (comment: string, restricted: boolean, selection?: Selection | undefined) => {
		return fileComments.create({
			submissionID: file.references.submissionID,
			comment,
			snippet: selection,
			visibility: restricted ? ThreadState.private : ThreadState.public
        })
        .then(thread => true)
        .catch(err => {
            // TODO: handle error
            console.log(err);
            return false;
        });
	};
	
	return <div className="contentTab">
		<div className="m-3">
			<Viewer file={file} sendComment={sendComment} />
		</div>
	</div>
}