import React, {useEffect, useState} from "react";
import {Controlled as CodeMirror} from "react-codemirror2";

import {noPosition, Snippet} from "../../../../models/api/Snippet";

import {ClickHelper} from "../../helpers/ClickHelper";
import {getRanges, Range} from "../../helpers/HighlightingHelper";
import {SelectionHelper} from "../../helpers/SelectionHelper";

import {Code, CodeProperties, defaultHandler} from "./Code";

export interface SnippetHighlight extends Snippet {
	onClick: Function,
}
export interface HighlightedCodeProperties extends CodeProperties {
    snippets: SnippetHighlight[],
	selecting: boolean
}
export function HighlightedCode({code, options, snippets, selecting, handleInitialize = defaultHandler, handleSelect = defaultHandler, handleClick = defaultHandler, handleChange = defaultHandler}: HighlightedCodeProperties) {
	const [codeMirror, setCodeMirror] = useState(undefined as unknown as CodeMirror.Editor);
	const [click, setClick] = useState(noPosition);
	let hasMoved: Boolean = false;
	let topPriority: SnippetHighlight | undefined = undefined;
	
	/**
	 * Highlights comments passed to the code viewer.
	 */
	const setCommentHighlights = () => {
		const color = "#3FDAC1";
		const opacityRange = ["00", "6F", "BF", "FF"];
		
		// Highlight based on ranges
		if (codeMirror && snippets) {
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

	useEffect(setCommentHighlights, [codeMirror, snippets]);
	
	const handleDown = () => {
		if (snippets && !selecting && click !== noPosition) {
			
			// Find the topPriority snippet matching the click location
			for (const snippet of snippets) {
				if (SelectionHelper.in(snippet, click)) {
					if (SelectionHelper.priority(snippet, topPriority)) {
						topPriority = snippet;
					}
				}
			}
		}
	};

	const handleMove  = () => {
		hasMoved = true
	};

	const handleUp = () => {
		if (!hasMoved) {
			if (topPriority) {
				topPriority.onClick();
				hasMoved = false
				topPriority = undefined;
			}
		}
	};
	
	return <div onMouseUp={handleUp} onMouseDown={handleDown} onTouchStart={handleDown} onTouchEnd={handleUp} onMouseMove={handleMove} onTouchMove={handleMove}><Code
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
				const pagePosition = ClickHelper.pagePosition(event);
				const cursor = editor.coordsChar({left: pagePosition.x, top: pagePosition.y});
				setClick({line: cursor.line, character: cursor.ch});
			}
		}}
		handleChange={handleChange}
	/></div>;
}