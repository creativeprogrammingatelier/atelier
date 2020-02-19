import React, {Component, Ref, TextareaHTMLAttributes, useImperativeHandle, DOMElement} from 'react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/oceanic-next.css';
import 'codemirror/mode/clike/clike.js';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/search/jump-to-line.js';
import CodeMirror from 'codemirror';
import {FileComment} from "./submission/CodeTab";

type CodeViewerProps = {
	cursorLineNumber: number;
	cursorCharacterNumber : number;
	file: any;
	updateCursorLocation: Function;
	comments? : FileComment[];
};

type CodeViewerState = {
	file: any,
	formattedCode: string,
	updateCursorLocation: Function,
	cursorLineNumber: number,
	cursorCharacterNumber : number,

	selecting : boolean,
	selection : string
	commentLineStart : number,
	commentCharacterStart : number,
	commentLineEnd : number,
	commentCharacterEnd : number
}

class CodeViewer extends React.Component<CodeViewerProps, CodeViewerState> {
	movedByMouse: boolean = false;
	codeMirror!: CodeMirror.Editor;

	constructor(props: CodeViewerProps) {
		super(props);
		this.state = {
			file: props.file,
			updateCursorLocation: props.updateCursorLocation,
			formattedCode: props.file.body,
			cursorLineNumber: props.cursorLineNumber,
			cursorCharacterNumber : props.cursorCharacterNumber,

			selecting : false,
			selection : "",
			commentLineStart : 0,
			commentCharacterStart : 0,
			commentLineEnd : 0,
			commentCharacterEnd : 0
		};
	}

	componentDidUpdate(props: CodeViewerProps) {
		if (props.file != this.state.file) {
			this.codeMirrorUpdate();
		}
		this.selectLine();
	}

	componentDidMount() {
		this.codeMirrorUpdate();
		this.selectLine();
	}

	codeMirrorUpdate() {
		console.log("update");
		let textEditorNullable: HTMLElement | null = document.getElementById('text-editor');
		if (textEditorNullable != null && textEditorNullable instanceof HTMLTextAreaElement) {
			let textEditor: HTMLTextAreaElement = textEditorNullable;

			// Handle initialization
			(this.codeMirror != null) ?
				this.codeMirror.setValue(this.state.formattedCode)
				:
				this.codeMirror = CodeMirror.fromTextArea(textEditor, {mode: 'text/x-java', lineNumbers: true, styleActiveLine: true, theme: 'oceanic-next', value: this.state.formattedCode});

			this.codeMirror.setSize('100%', '100%');

			// Handle mouse activity
			this.codeMirror.on('cursorActivity', (instanceCodeMirror: CodeMirror.Editor) => {
				if (this.movedByMouse) {
					this.setStateSelectedLine();
				}
				this.updateSelection();
				console.log("reached, selected: " + this.state.selection + "\n::::" + this.codeMirror.getSelection());
			});
			this.codeMirror.on('mousedown', (instanceCodeMirror: CodeMirror.Editor) => {
				this.movedByMouse = true;
			});

			// Mark comments
			if (this.props.comments != undefined) {
				for (const {startLine, startCharacter, endLine, endCharacter} of this.props.comments) {
					// code mirror starts lines at 0, while comments are stored starting at 1
					this.codeMirror.markText({line: startLine - 1, ch: startCharacter}, {line: endLine - 1, ch: endCharacter}, {css : "background-color: #abcdef7f; "});
				}
			}
		}
	}

	/**
	 * Set cursor location on screen
	 */
	selectLine() {
		console.log("setting cursor: " + this.state.cursorLineNumber + " " + this.state.cursorCharacterNumber);
		this.movedByMouse = false;
		this.codeMirror.setCursor({line : this.state.cursorLineNumber, ch : this.state.cursorCharacterNumber});
	}

	/**
	 * Handle and store updates in the selection
	 */
	updateSelection() {

		const selection = this.codeMirror.listSelections();
		console.log("updating selection: " + this.codeMirror.listSelections()[0].anchor.line + "-" + this.codeMirror.listSelections()[0].head.line + "\n::" + this.codeMirror.getSelection());
		if (selection.length == 0) return;

		let start, end;
		if (selection[0].anchor.line < selection[0].head.line
			|| (selection[0].anchor.line == selection[0].head.line && selection[0].anchor.ch < selection[0].anchor.ch)) {
			start = selection[0].anchor;
			end = selection[0].head;
		}  else {
			start = selection[0].head;
			end = selection[0].anchor;
		}

		this.setState({
			selection : this.codeMirror.getSelection(),
			commentLineStart : start.line,
			commentCharacterStart : start.ch,
			commentLineEnd : end.line,
			commentCharacterEnd : end.ch
		});

		console.log(`${this.state.commentLineStart}:${this.state.commentCharacterStart}-${this.state.commentLineEnd}:${this.state.commentCharacterEnd}`);
	}

	/**
	 * Handle clicks on comments
	 */
	checkCommentClick() {
		const line = this.codeMirror.getCursor().line + 1; // editor lines start at 1
		const character = this.codeMirror.getCursor().ch;

		// On click check if the coordinates of the click correspond to a comment
		const comments : FileComment[] | undefined = this.props.comments;

		// Click first comment in the overlap
		if (comments != undefined) {
			let first : FileComment | undefined;
			for (const comment of comments) {
				const {startLine, startCharacter, endLine, endCharacter, commentID, onClick} = comment;
				if ((startLine < line || (startLine == line && startCharacter <= character)) &&
					(line < endLine || (line == endLine && character <= endCharacter))) {
					if (first == undefined) {
						first = comment;
					} else if (startLine < first.startLine || (startLine == first.startLine && startCharacter < first.startCharacter)){
						first = comment;
					}
				}
			}
			if (first != undefined) first.onClick();
		}
	}

	/**
	 * Handle changes to line and character. Passes them to parent components using updateCursorLocation()
	 */
	setStateSelectedLine() {
		const characterNumber = this.codeMirror.getCursor().ch;
		const lineNumber = this.codeMirror.getCursor().line;

		// Update current cursor position on click
		this.state.updateCursorLocation(lineNumber, characterNumber);
		this.setState({
			cursorCharacterNumber : characterNumber,
			cursorLineNumber : lineNumber
		});

		// Check whether a comment was clicked
		this.checkCommentClick();
	}

	//https://hackernoon.com/replacing-componentwillreceiveprops-with-getderivedstatefromprops-c3956f7ce607
	static getDerivedStateFromProps(nextProps: CodeViewerProps, prevState: CodeViewerState) {
		return {
			file: nextProps.file,
			commentLineNumber: nextProps.cursorLineNumber,
			formattedCode: nextProps.file.body
		};
	}

	/**
	 * Toggle between selecting (for comment) and not
	 * @param select, whether currently in select mode or not
	 */
	handleSelect(select : boolean) {
		this.setState({
			selecting : select
		});
	}

	/**
	 * Add a comment. Reads line/character numbers and the selection.
	 */
	addComment() {
		const comment = this.state.selection;

		const startLine = this.state.commentLineStart;
		const endLine = this.state.commentLineEnd;
		const startCharacter = this.state.commentCharacterStart;
		const endCharacter = this.state.commentCharacterEnd;

		console.log(`Created comment ${startLine}:${startCharacter} - ${endLine}:${endCharacter}: ${comment}`);
		// TODO databaseRoutes query
	}


	render() {
		return (
			<div>
				<textarea id="text-editor" autoComplete='off' value={this.state.formattedCode}/>
				{
					this.state.selecting ?
						<div className="selectionButtons">
							<button id='cancelComment' onClick={() => this.handleSelect(false)}>Cancel Selection</button>
							<button id='addComment' onClick={() => this.addComment()}>Add Comment</button>
							<input type='text' placeholder='select code' value={this.state.selection} />
						</div>
						:
						<div className="selectionButtons">
							<button id='createComment' onClick={() => this.handleSelect(true)}>Add Comment</button>
						</div>
				}

			</div>
		);
	}
}

export default CodeViewer;