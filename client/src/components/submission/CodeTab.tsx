import React, {useState} from "react";
import {File} from "../../../../models/database/File";
import CodeViewer2 from "../CodeViewer2";
import {OpenFileResponse} from "../../helpers/DatabaseResponseInterface";
import {Loading} from "../general/Loading";
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
		<h1>{FileNameHelper.fromPath(file.pathname!)}</h1>
		<CodeViewer2 submissionID={submissionID} fileID={file.fileID!} fileContents={body} />
        {/*<Loading<string>*/}
        {/*    loader={getFileContents}*/}
        {/*    component={fileContents =>*/}
		{/*        <CodeViewer2 fileContents={body} submissionID={submissionID} fileID={file.fileID!} />} />*/}
	</div>
}