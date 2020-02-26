import React, {useState} from "react";
import {File} from "../../../../models/database/File";
import CodeViewer2 from "../CodeViewer2";
import {OpenFileResponse} from "../../helpers/DatabaseResponseInterface";
import AuthHelper from "../../../helpers/AuthHelper";
import { Loading } from "../general/Loading";

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
	comments?: FileComment[],
}

export function CodeTab({file, submissionID} : CodeProperties) {
    const getFileContents = () => AuthHelper.fetch(`/api/file/${file.fileID}/body`).then((res: Response) => res.text());

	return <div>
		<h1>{file.pathname}</h1>
        <Loading<string>
            loader={getFileContents}
            component={fileContents =>
		        <CodeViewer2 fileContents={fileContents} submissionID={submissionID} fileID={file.fileID!} />} />
	</div>;
}