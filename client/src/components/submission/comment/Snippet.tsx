import React, {useState} from "react";

import {Snippet} from "../../../../../models/api/Snippet";
import {Link} from "react-router-dom";
import {ButtonBar} from "../../general/ButtonBar";
import {Button} from "react-bootstrap";
import {FiChevronDown, FiChevronUp, FiCode} from "react-icons/all";
import {MINIMIZED_LINES} from "../../../helpers/CommentHelper";

interface SnippetProperties {
	snippet: Snippet
}

export function Snippet({snippet}: SnippetProperties) {
	const [expanded, updateExpanded] = useState(false);
	const completeSnippet : string[] = snippet.body.split('\r').join("").split('\n');

	// TODO top context required from database
	// TODO bottom context required from database
	const preLines : string[] = [];
	const mainLines : string[] = completeSnippet.slice(0, Math.min(completeSnippet.length, MINIMIZED_LINES));
	// Append spaces to the first line to match indentation (in case user starts selection at character 4 for example)
	if (mainLines.length > 0) mainLines[0] = " ".repeat(snippet.start.character) + mainLines[0];
	const postLines : string[] = completeSnippet.slice(MINIMIZED_LINES);

	return (
		<div className="snippet">
            <pre className="m-0 px-2 py-1">
                {(expanded && preLines.length > 0) && preLines.join("\n") + "\n"}
	            <span>{mainLines.join("\n")}</span>
	            {(expanded && postLines.length > 0) && "\n" + postLines.join("\n")}
            </pre>
			<ButtonBar align="right">
				<Button>
					<Link to={`/submission/${snippet.references.submissionID}/${snippet.file.ID}/code#${snippet.start.line}`}>
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