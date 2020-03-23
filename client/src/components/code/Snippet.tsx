import React from "react";
import "codemirror/lib/codemirror.css";
import "../../styles/codemirror.scss";

import {Snippet} from "../../../../models/api/Snippet";
import {MINIMIZED_LINES} from "../../../../helpers/SnippetHelper";
import {Controlled as CodeMirror} from "react-codemirror2";
import {codeViewerOptions} from "./CodeViewer";

interface SnippetProperties {
	snippet: Snippet,
	expanded?: boolean
}
export function Snippet({snippet, expanded}: SnippetProperties) {
	const completeSnippet: string[] = snippet.body.split("\r").join("").split("\n");

	const databaseTop: string = snippet.contextBefore;
	const linesTop: number = (databaseTop.split("\r").join("").split("\n").length);
	const databaseBottom: string = snippet.contextAfter;


	const preLines: string = databaseTop;
	const mainLines: string = completeSnippet.slice(0, Math.min(completeSnippet.length, MINIMIZED_LINES)).join("\n");
	const postLines: string = completeSnippet.slice(MINIMIZED_LINES).join("\n") + databaseBottom;

	return (
		<div className="snippet">
			<CodeMirror
				value={expanded ? preLines + mainLines + postLines : mainLines}
				options={{
					...codeViewerOptions,
					firstLineNumber: expanded ? snippet.start.line + 2 - linesTop : snippet.start.line + 1,
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
		</div>
	);
}