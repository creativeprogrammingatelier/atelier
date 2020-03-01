import React, {useState} from "react";

import {Snippet} from "../../../placeholdermodels";
import {Link} from "react-router-dom";
import {ButtonBar} from "../../general/ButtonBar";
import {Button} from "react-bootstrap";
import {FiChevronDown, FiChevronUp, FiCode} from "react-icons/all";

interface SnippetProperties {
	snippet: Snippet
}

export function Snippet({snippet}: SnippetProperties) {
	const [expanded, updateExpanded] = useState(false);

	const [begin, end] = snippet.mainLines;
	const preLines = snippet.fullText.slice(0, begin);
	const mainLines = snippet.fullText.slice(begin, end);
	const postLines = snippet.fullText.slice(end);

	const highlightStyle: React.CSSProperties =
		expanded
			? {}
			: {};
	// TODO: previously mainlines had a styling, however main lines are only what we show. The actual snippet is usually
	// the whole snippet except 0/2 lines on the bottom/top. Do we want to do highlighting for all these lines or
	// keep it without highlighting? Highlighting looked weird now since almost all lines are highlighted then.

	return (
		<div className="snippet">
            <pre className="m-0 px-2 py-1">
                {expanded && preLines.join("\n") + "\n"}
	            <span style={highlightStyle}>{mainLines.join("\n")}</span>
	            {expanded && "\n" + postLines.join("\n")}
            </pre>
			<ButtonBar align="right">
				<Button>
					<Link to={`/files/${snippet.fileId}#line=${snippet.fileLines[0]}-${snippet.fileLines[1]}`}>
						<FiCode/>
					</Link>
				</Button>
				<Button onClick={() => updateExpanded(expanded => !expanded)}>
					{expanded ? <FiChevronUp color="#FFFFFF"/> : <FiChevronDown color="#FFFFFF"/>}
				</Button>
			</ButtonBar>
		</div>
	);
}