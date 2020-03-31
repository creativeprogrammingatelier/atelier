import React, {useEffect} from "react";
import * as codemirror from "codemirror";
import {Controlled as CodeMirror} from "react-codemirror2";
import 'codemirror/mode/clike/clike.js';
import "codemirror/lib/codemirror.css";
import "../../styles/codemirror.scss";
import {ScrollHelper} from "../../helpers/ScrollHelper";
import {Block} from "../general/Block";
import {Area} from "../general/Area";

// TODO: Resolve inconsistent naming around Controlled, CodeMirror and codemirror

export interface CodeSelection {
	ranges: Array<{
		head: CodeMirror.Position,
		anchor: CodeMirror.Position
	}>
}
export interface CodeProperties {
	code: string,
	options?: codemirror.EditorConfiguration,
	handleInitialize?: (editor: codemirror.Editor) => void,
	handleSelect?: (editor: codemirror.Editor, data: CodeSelection) => void | boolean,
	handleClick?: (editor: codemirror.Editor, event: Event) => void | boolean,
	handleChange?: (editor: codemirror.Editor, data: codemirror.EditorChange, value: string) => void | boolean
}
export function Code({code, options = {}, handleInitialize = defaultHandler, handleSelect = defaultHandler, handleClick = defaultHandler, handleChange = defaultHandler}: CodeProperties) {
	useEffect(ScrollHelper.scrollToHash, []);

	/**
	 * Add Id's to line in the code to allow #lineNumber in the url
	 */
	function setLineIDs() {
		const codeLines = document.getElementsByClassName("CodeMirror-code")[0].childNodes;
		let lineNumber = 1;
		for (const codeLine of codeLines) {
			(codeLine as Element).id = `${lineNumber++}`;
		}
	}

	// Define syntax highlighting for MIME types
	codemirror.defineMIME("text/x-processing", "text/x-java");

	return <CodeMirror
		value={code}
		// options={{...defaultOptions, ...options}}
		options={{...defaultOptions, ...options}}
		editorDidMount={editor => {
			// Standard code viewer initialization
			editor.setSize('100%', '100%');
			setLineIDs();

			// Given initialization
			handleInitialize(editor);
		}}
		onSelection={handleSelect}
		onMouseDown={handleClick}
		onTouchStart={handleClick}
		onBeforeChange={handleChange}
		onChange={handleChange}
	/>
}
export const defaultOptions = {
	mode: "text/x-java",
	theme: "atelyay",
	lineNumbers: true,
	tabSize: 4,
	indentUnit: 4,
	indentWithTabs: true
};
export const defaultHandler = () => {};