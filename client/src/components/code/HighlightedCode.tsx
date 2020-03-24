import React, {useEffect, useReducer, useState} from "react";
import {Code, CodeProperties, defaultHandler} from "./Code";
import {getRanges, Range} from "../../helpers/HighlightingHelper";
import {FileSnippet} from "../submission/CodeTab";
import {Controlled as CodeMirror} from "react-codemirror2";
import {Position, noPosition} from "../../../../models/api/Snippet";

export interface HighlightedCodeProperties extends CodeProperties {
	snippets: FileSnippet[]
}
export function HighlightedCode({code, options, snippets, handleInitialize = defaultHandler, handleSelect = defaultHandler, handleClick = defaultHandler, handleChange = defaultHandler}: HighlightedCodeProperties) {
	const [codeMirror, setCodeMirror] = useState(undefined as unknown as CodeMirror.Editor);
	const [click, setClick] = useState(noPosition);
	const forceUpdate = useReducer(() => ({}), {})[1] as () => void;

	console.log("Rendering a highlighted code view");
	console.log(snippets);

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
					startLine: snippet.startLine,
					startChar: snippet.startCharacter,
					endLine: snippet.endLine,
					endChar: snippet.endCharacter,
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
			let first: FileSnippet | undefined;

			// Find the first snippet matching the click location
			for (const snippet of snippets) {
				console.log("Checking snippet");
				console.log(snippet);
				const {startLine, startCharacter, endLine, endCharacter} = snippet;
				if (
					(startLine < click.line || (startLine === click.line && startCharacter <= click.character)) &&
					(endLine > click.line || (endLine === click.line && endCharacter >= click.character))
				) {
					if (
						first === undefined ||
						startLine < first.startLine ||
						(startLine === first.startLine && startCharacter < first.startCharacter)
					) { // TODO: WebStorm doesnt like this line, and neither do I
						first = snippet;
					}
				}
			}

			// Call on click for comment
			if (first !== undefined) {
				first.onClick();
			}
		}
	};

	useEffect(setCommentHighlights, [codeMirror, snippets]);
	useEffect(() => {console.log("Changed snippets"); console.log(snippets)}, [snippets]);
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
			console.log("Handling a click");
			console.log(options);
			console.log(snippets);
			console.log(handleClick);
			if (handleClick(editor, event) !== false) {
				setClick({line: editor.getCursor().line, character: editor.getCursor().ch});
				// setTimeout(() => {
				// 	clickComment(editor.getCursor().line, editor.getCursor().ch);
				// }, 10);
			}
		}}
		handleChange={handleChange}
	/>;
}