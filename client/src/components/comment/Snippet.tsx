import React from "react";

import {Snippet} from "../../../../models/api/Snippet";
import {MINIMIZED_LINES} from "../../helpers/CommentHelper";
import {Controlled as CodeMirror} from "react-codemirror2";

interface SnippetProperties {
	snippet: Snippet,
	expanded?: boolean
}

export function Snippet({snippet, expanded}: SnippetProperties) {
	const completeSnippet: string[] = snippet.body.split("\r").join("").split("\n");

	const databaseTop : string = snippet.contextBefore;
	console.log(snippet);
	const linesTop : number = (databaseTop.split('\r').join("").split('\n').length);
	const databaseBottom : string = snippet.contextAfter;


	const preLines: string = databaseTop + ((databaseTop.length > 0) ? "\n" : "");
	const mainLines: string =
		completeSnippet.slice(0, Math.min(completeSnippet.length, MINIMIZED_LINES)).join("\n");
	const postLines: string = completeSnippet.slice(MINIMIZED_LINES).join("\n") + "\n" + databaseBottom;

	return (
		<div className="snippet">
			<CodeMirror
				value={expanded ? preLines + mainLines + postLines : mainLines}
				options={{
					mode: "clike",
					theme: "base16-light",
					lineNumbers: true,
					firstLineNumber: expanded ? snippet.start.line + 1 - linesTop : snippet.start.line + 1,
					readOnly: "nocursor"
				}}
				editorDidMount={
					editor => {
						editor.setSize("100%", "100%");
					}
				}
				onBeforeChange={() => {
					// nothing here so editing is not possible
				}}
			/>

			{/*<ButtonBar align="right">*/}
			{/*	<Button>*/}
			{/*		<Link to={`/submission/${snippet.references.submissionID}/${snippet.file.ID}/code#${snippet.start.line + 1}`}>*/}
			{/*			<FiCode size={14} color="#FFFFFF"/>*/}
			{/*		</Link>*/}
			{/*	</Button>*/}
			{/*	<Button onClick={() => updateExpanded(expanded => !expanded)}>*/}
			{/*		{expanded ? <FiChevronUp size={14} color="#FFFFFF"/> : <FiChevronDown size={14} color="#FFFFFF"/>}*/}
			{/*	</Button>*/}
			{/*</ButtonBar>*/}
		</div>
	);
}