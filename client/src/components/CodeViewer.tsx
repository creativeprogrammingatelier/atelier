import React, {Component, Ref, TextareaHTMLAttributes, useImperativeHandle, DOMElement} from 'react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/oceanic-next.css';
import 'codemirror/mode/clike/clike.js';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/search/jump-to-line.js';
import CodeMirror from 'codemirror';
import {IFile} from '../../../models/file';
import {FileComment} from "./submission/CodeTab";

type CodeViewerProps = {
	commentLineNumber: number;
	commentCharacterNumber : number;
	file: IFile;
	updateCursorLocation: Function;
	comments? : FileComment[];
};

type CodeViewerState = {
	file: IFile,
	formattedCode: string,
	updateCursorLocation: Function,
	commentLineNumber: number,
	commentCharacterNumber : number,
	cursorLeft : number,
	cursorTop : number
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
			commentLineNumber: props.commentLineNumber,
			commentCharacterNumber : props.commentCharacterNumber,
			cursorLeft : 0,
			cursorTop : 100
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
		let textEditorNullable: HTMLElement | null = document.getElementById('text-editor');
		if (textEditorNullable != null && textEditorNullable instanceof HTMLTextAreaElement) {
			let textEditor: HTMLTextAreaElement = textEditorNullable;

			(this.codeMirror != null) ?
				this.codeMirror.setValue(this.state.formattedCode)
				:
				this.codeMirror = CodeMirror.fromTextArea(textEditor, {mode: 'text/x-java', lineNumbers: true, styleActiveLine: true, theme: 'oceanic-next', value: this.state.formattedCode});

			this.codeMirror.setSize('100%', '100%');
			this.codeMirror.on('cursorActivity', (instanceCodeMirror: CodeMirror.Editor) => {
				this.checkSelectedText();
				if (this.movedByMouse) {
					this.setStateSelectedLine();
				}
			});
			this.codeMirror.on('mousedown', (instanceCodeMirror: CodeMirror.Editor) => {
				this.movedByMouse = true;
			});

			if (this.props.comments != undefined) {
				for (const {startLine, startCharacter, endLine, endCharacter} of this.props.comments) {
					// TODO add custom class for different depths. No way to distinguish overlapping comments at the moment
					// code mirror starts lines at 0, while comments are stored starting at 1
					this.codeMirror.markText({line: startLine - 1, ch: startCharacter}, {line: endLine - 1, ch: endCharacter}, {className : "text-danger"});
				}
			}
		}
	}

	selectLine() {
		this.movedByMouse = false;
		this.codeMirror.setCursor({line : this.state.commentLineNumber, ch : this.state.commentCharacterNumber});
	}

	checkSelectedText() {
		const selected : string | undefined = this.codeMirror.getSelection();
		if (selected != "") {
			/*const coords = this.codeMirror.cursorCoords(true);
			this.setState({
				cursorLeft : coords.left,
				cursorTop : coords.top
			});*/
			//console.log(this.codeMirror.cursorCoords(true));
		}

		console.log("selected: " + selected);
	}

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

	setStateSelectedLine() {
		//let doc: any = this.codeMirror.getDoc();
		//let anchor = doc.sel.ranges[0].anchor.line;
		//let head = doc.sel.ranges[0].head.line;
		//let lineNumber = (anchor > head) ? head : anchor;

		const characterNumber = this.codeMirror.getCursor().ch;
		const lineNumber = this.codeMirror.getCursor().line;

		// Update current cursor position on click
		this.state.updateCursorLocation(lineNumber, characterNumber);
		this.setState({
			commentCharacterNumber : characterNumber,
			commentLineNumber : lineNumber
		});

		// Check whether a comment was clicked
		this.checkCommentClick();
	}

	//https://hackernoon.com/replacing-componentwillreceiveprops-with-getderivedstatefromprops-c3956f7ce607
	static getDerivedStateFromProps(nextProps: CodeViewerProps, prevState: CodeViewerState) {
		return {
			file: nextProps.file,
			commentLineNumber: nextProps.commentLineNumber,
			formattedCode: nextProps.file.body
		};
	}

	render() {
		return (
			<div>
				<textarea id="text-editor" autoComplete='off' value={this.state.formattedCode}/>

			</div>
		);
	}
}

export default CodeViewer;

/*
<div
					style={{position: "absolute", left: this.state.cursorLeft + 'px', top: this.state.cursorTop + 'px'}}>
					Comment Text
				</div>
 */