import React from "react";
import {Code, CodeProperties} from "./Code";
import {getRanges, Range} from "../../helpers/HighlightingHelper";
import {FileSnippet} from "../submission/CodeTab";
import {Controlled as CodeMirror} from "react-codemirror2";

export interface HighlightedCodeProperties extends CodeProperties {
	snippets: FileSnippet[]
}
export function HighlightedCode({code, options, snippets, handleInitialize = () => {}, handleSelect = () => {}, handleClick = () => {}, handleChange = () => {}}: HighlightedCodeProperties) {
	let codeMirror: CodeMirror.Editor;



	/**
	 * Highlights comments passed to the code viewer.
	 */
	function setCommentHighlights() {
		const color = "#dc3339";
		const opacityRange = ["00", "6F", "BF", "FF"];

		/** Highlight based on ranges */
		if (snippets !== undefined) {
			// Transform each snippet into a range of characters
			const ranges: Range[] = snippets.map(snippet => {
				return {
					startLine: snippet.startLine,
					startChar: snippet.startCharacter,
					endLine: snippet.endLine,
					endChar: snippet.endCharacter,
					overlap: 1
				}
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
	}

	/**
	 * Handle click in the code canvas. Pass line and character of the cursor click.
	 * Loops through the comments to check whether a comment was clicked. If this is
	 * the case the first comment will have its onClick method called.
	 *
	 * @param line, line number of the click
	 * @param character, character location in the line of the click
	 */
	function clickComment(line : number, character : number) {
		if (snippets !== undefined) {
			let first: FileSnippet | undefined;

			// Find the first snippet matching the click location
			for (const snippet of snippets) {
				const {startLine, startCharacter, endLine, endCharacter} = snippet;
				if ((startLine < line || (startLine === line && startCharacter <= character)) && (line < endLine || (line === endLine && character <= endCharacter))) {
					if (first === undefined || startLine < first.startLine || (startLine === first.startLine && startCharacter < first.startCharacter)) {
						first = snippet;
					}
				}
			}

			// Call on click for comment
			if (first !== undefined) {
				first.onClick();
			}
		}
	}

	return <Code
		code={code}
		options={options}
		handleInitialize={
			editor => {
				handleInitialize(editor);
				codeMirror = editor;
				setCommentHighlights();
			}}
		handleSelect={handleSelect}
		handleClick={(editor, event) => {
			if (handleClick(editor, event) !== false) {
				setTimeout(() => {
					clickComment(editor.getCursor().line, editor.getCursor().ch);
				}, 10);
			}
		}}
		handleChange={handleChange}
	/>
}