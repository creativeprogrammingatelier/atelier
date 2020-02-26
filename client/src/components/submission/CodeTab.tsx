import React, {useState} from "react";
import {File} from "../../../../models/database/File";
import CodeViewer2 from "../CodeViewer2";
import {OpenFileResponse} from "../../helpers/DatabaseResponseInterface";
import AuthHelper from "../../../helpers/AuthHelper";
import { Loading } from "../general/Loading";
import { Fetch } from "../../../helpers/FetchHelper";

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
    file: File,
	body : string,
	comments?: FileComment[],
}

export function CodeTab({file, body, submissionID} : CodeProperties) {


	return <div>
		<h1>{file.pathname}</h1>
		<CodeViewer2 submissionID={submissionID} fileID={file.fileID!} fileContents={body} />
        {/*<Loading<string>*/}
        {/*    loader={getFileContents}*/}
        {/*    component={fileContents =>*/}
		{/*        <CodeViewer2 fileContents={body} submissionID={submissionID} fileID={file.fileID!} />} />*/}
	</div>
}