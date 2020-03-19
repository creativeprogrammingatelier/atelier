import React, {useEffect} from "react";
import {File} from "../../../../models/api/File";
import {CodeViewer} from "../code/CodeViewer";
import {ScrollHelper} from "../../helpers/ScrollHelper";

export interface FileComment {
	startLine: number,
	startCharacter: number,
	endLine: number,
	endCharacter: number,
	onClick: Function,
	commentID: number
}

export interface FileSnippet {
	startLine: number,
	startCharacter: number,
	endLine: number,
	endCharacter: number,
	onClick: Function,
	snippetID: string,
	commentThreadID: string
}

interface CodeProperties {
	submissionID : string,
    file: File,
	body : string,
	comments?: FileComment[],
}

export function CodeTab({file, body, submissionID} : CodeProperties) {
	useEffect(() => ScrollHelper.scrollToHash(), []);

	return <div className="contentTab">
		<div className="m-3">
			<CodeViewer
				submissionID={submissionID}
				file={file}
				fileContents={body}
			/>
		</div>
	</div>
}