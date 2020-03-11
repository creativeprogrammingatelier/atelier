import React, {useState} from "react";
import {File} from "../../../../models/api/File";
import {CodeViewer2} from "../CodeViewer2";
import {FileNameHelper} from "../../helpers/FileNameHelper";

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
	return <div className="contentTab">
		<div className="m-3">
			<CodeViewer2
				submissionID={submissionID}
				file={file}
				fileContents={body}
			/>
		</div>
	</div>
}