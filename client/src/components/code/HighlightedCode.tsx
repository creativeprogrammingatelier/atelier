import React, {useEffect, useState} from "react";
import {Code, CodeProperties, defaultHandler} from "./Code";
import {getRanges, Range} from "../../helpers/HighlightingHelper";
import {Controlled as CodeMirror} from "react-codemirror2";
import {noPosition} from "../../../../models/api/Snippet";
import {SnippetHighlight} from "../submission/FileOverview";
import {SelectionHelper} from "../../helpers/SelectionHelper";

export interface HighlightedCodeProperties extends CodeProperties {
	snippets: SnippetHighlight[]
}
export function HighlightedCode({code, options, snippets, handleInitialize = defaultHandler, handleSelect = defaultHandler, handleClick = defaultHandler, handleChange = defaultHandler}: HighlightedCodeProperties) {
	const [codeMirror, setCodeMirror] = useState(undefined as unknown as CodeMirror.Editor);
	const [click, setClick] = useState(noPosition);

	/**
	 * Highlights comments passed to the code viewer.
	 */
	const setCommentHighlights = () => {
		const color = "#3fdac1";
		const opacityRange = ["00", "6F", "BF", "FF"];

		// Highlight based on ranges
		if (snippets) {
			// Transform each snippet into a range of characters
			const ranges: Range[] = snippets.map(snippet => {
				return {
					startLine: snippet.start.line,
					startChar: snippet.start.character,
					endLine: snippet.end.line,
					endChar: snippet.end.character,
					overlap: 1
				};
			});

			// Take care of overlap and things between the different ranges
			const highlightRanges: Range[] = getRanges(ranges);


			for (const {startLine, startChar, endLine, endChar, overlap} of highlightRanges) {
				const opacity = opacityRange[Math.min(overlap, opacityRange.length - 1)];

				codeMirror.markText({
					line: startLine, ch: startChar
				}, {
					line: endLine, ch: endChar
				}, {
					css: `background-color: ${color}${opacity};`
				});
			}
		}
	};

	/**
	 * Handle click in the code canvas.
	 * Loops through the comments to check whether a comment was clicked. If this is
	 * the case the first comment will have its onClick method called.
	 */
	const clickComment = () => {
		console.log("Clicked a comment");
		console.log(click);
		console.log(snippets);
		if (snippets) {
			let topPriority: SnippetHighlight | undefined = undefined;

			// Find the topPriority snippet matching the click location
			for (const snippet of snippets) {
				console.log("Checking snippet");
				console.log(snippet);
				if (SelectionHelper.priority(snippet, topPriority)) {
					topPriority = snippet;
				}
			}

			// Call on click for comment
			if (topPriority !== undefined) {
				topPriority.onClick();
			}
		}
	};

	useEffect(setCommentHighlights, [codeMirror, snippets]);
	useEffect(clickComment, [click]);

	return <Code
		code={code}
		options={options}
		handleInitialize={
			editor => {
				handleInitialize(editor);
				setCodeMirror(editor);
			}}
		handleSelect={handleSelect}
		handleClick={(editor, event) => {
			if (handleClick(editor, event) !== false) {
				setClick({line: editor.getCursor().line, character: editor.getCursor().ch});
			}
		}}
		handleChange={handleChange}
	/>;
}