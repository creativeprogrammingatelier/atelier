import React, {useState} from 'react';

import {Snippet} from '../../placeholdermodels';
import {Link} from 'react-router-dom';

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
			? {backgroundColor: '#eee'}
			: {};

	return (
		<div>
            <pre>
                {expanded && preLines.join('\n') + '\n'}
	            <span style={highlightStyle}>{mainLines.join('\n')}</span>
	            {expanded && '\n' + postLines.join('\n')}
            </pre>
			<button onClick={() => updateExpanded(ex => !ex)}>
				{expanded ? 'Collapse' : 'Show more'}
			</button>
			<Link to={`/files/${snippet.fileId}#line=${snippet.fileLines[0]}-${snippet.fileLines[1]}`}>
				View in code file
			</Link>
		</div>
	);
}