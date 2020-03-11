import React, {useState} from "react";

import {Snippet} from "../../../../../models/api/Snippet";
import {Link} from "react-router-dom";
import {ButtonBar} from "../../general/ButtonBar";
import {Button} from "react-bootstrap";
import {FiChevronDown, FiChevronUp, FiCode} from "react-icons/all";
import {MINIMIZED_LINES} from "../../../helpers/CommentHelper";
import {Controlled as CodeMirror} from "react-codemirror2";

interface SnippetProperties {
	snippet: Snippet
}

export function Snippet({snippet}: SnippetProperties) {
	const [expanded, updateExpanded] = useState(false);
	const completeSnippet : string[] = snippet.body.split('\r').join("").split('\n');

	// TODO top context required from database
	const databaseTop : string = "";
	const linesTop : number = 0;
	// TODO bottom context required from database
	const databaseBottom : string = "";


	const preLines : string = databaseTop + ((databaseTop.length > 0) ? '\n' : "");
	// Prepend spaces to first line to match indentation in case uses does not start selection at the start of the line
	const mainLines : string =
		" ".repeat(snippet.start.character) +
		completeSnippet.slice(0, Math.min(completeSnippet.length, MINIMIZED_LINES)).join('\n');
	const postLines : string = completeSnippet.slice(MINIMIZED_LINES).join('\n') + '\n' + databaseBottom;

	return (
		<div className="snippet">
			<CodeMirror
				value = { expanded ? preLines + mainLines + postLines : mainLines }
				options = {{
					mode : 'clike',
					theme : 'base16-light',
					lineNumbers : true,
					firstLineNumber : expanded ? snippet.start.line + 1 - linesTop : snippet.start.line + 1
				}}
				editorDidMount={
					editor => {
						editor.setSize('100%', '100%');
					}
				}
				onBeforeChange={() => {
					// nothing here so editing is not possible
				}}
			/>

			<ButtonBar align="right">
				<Button>
					<Link to={`/submission/${snippet.references.submissionID}/${snippet.file.ID}/code#${snippet.start.line + 1}`}>
						<FiCode size={14} color="#FFFFFF"/>
					</Link>
				</Button>
				<Button onClick={() => updateExpanded(expanded => !expanded)}>
					{expanded ? <FiChevronUp size={14} color="#FFFFFF"/> : <FiChevronDown size={14} color="#FFFFFF"/>}
				</Button>
			</ButtonBar>
		</div>
	);
}