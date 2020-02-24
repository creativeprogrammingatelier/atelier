import React, {useState} from "react";
import {File} from "../../../../models/File";
import CodeViewer2 from "../CodeViewer2";
import {OpenFileResponse} from "../../helpers/DatabaseResponseInterface";

export interface FileComment {
	startLine: number,
	startCharacter: number,
	endLine: number,
	endCharacter: number,
	onClick: Function,
	commentID: number
}

export interface FileSnippet {
	startLine : number,
	startCharacter : number,
	endLine : number,
	endCharacter : number,
	onClick : Function,
	snippetID : string,
	commentThreadID : string
}

interface CodeProperties {
	submissionID : string,
	fileID : string
	file: OpenFileResponse,
	comments?: FileComment[],
}
export function CodeTab({file, submissionID, fileID} : CodeProperties) {

	return <div>
		<h1>{file.pathname}</h1>
		<CodeViewer2 file={file} fileBody={file.body} submissionID = {submissionID} fileID = {fileID} />
	</div>;
}