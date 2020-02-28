import React from 'react';
import 'codemirror/lib/codemirror.css';
// IMPORT THEME : https://codemirror.net/demo/theme.html#default
import 'codemirror/theme/eclipse.css';
import 'codemirror/theme/base16-light.css';
// IMPORT SYNTAX : https://codemirror.net/mode/
import 'codemirror/mode/clike/clike.js';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/search/jump-to-line.js';
import {Controlled as CodeMirror} from 'react-codemirror2';
import {FileSnippet} from "./submission/CodeTab";
import {Editor} from "codemirror";
import {WriteComment} from "./submission/comment/WriteComment";
import { Button } from 'react-bootstrap';

import {ExtendedThread} from "../../../models/database/Thread";
import { JsonFetchError } from '../../helpers/FetchHelper';
import { getFileComments, createFileCommentThread } from '../../helpers/APIHelper';

type CodeViewer2Props = {
	submissionID : string,
	fileID : string,
	fileContents : string
}

type CodeViewer2State = {
	formattedCode : string,
	selecting : boolean,
	commentSelection : string,

	snippets : FileSnippet[],
	commentThreads : ExtendedThread[],

	commentStartLine : number,
	commentStartCharacter : number,
	commentEndLine : number,
	commentEndCharacter : number
}

class CodeViewer2 extends React.Component<CodeViewer2Props, CodeViewer2State> {
	codeMirror!: CodeMirror.Editor;


	constructor(props : CodeViewer2Props) {
		super(props);

		this.state = {
			formattedCode : props.fileContents,
			selecting : false,
			commentSelection : "",

			snippets : [],
			commentThreads : [],

			commentStartLine : 0,
			commentStartCharacter : 0,
			commentEndLine : 0,
			commentEndCharacter : 0
		};

		// Bind methods that are called from onClick methods
		this.onSelection = this.onSelection.bind(this);
		this.onClick = this.onClick.bind(this);
		this.setSelecting = this.setSelecting.bind(this);
		this.addComment = this.addComment.bind(this);

		// Retrieve threads
		this.getCommentThreads();
	}

	componentDidUpdate(prevProps: Readonly<CodeViewer2Props>, prevState: Readonly<CodeViewer2State>, snapshot?: any): void {
		if (this.state.snippets !== prevState.snippets) {
			this.highlightComments();
		}
	}

	async getCommentThreads() {
        try {
            const threads = await getFileComments(this.props.fileID);
            console.log(threads);
            const snippets : FileSnippet[] = [];
            threads.map((commentThread : ExtendedThread) => {
                if (commentThread.snippet !== undefined) {
                    const snippet = commentThread.snippet;
                    snippets.push({
                        startLine : snippet.lineStart,
                        startCharacter : snippet.charStart,
                        endLine : snippet.lineEnd,
                        endCharacter : snippet.charEnd,
                        onClick : () => console.log(`Clicked snippet: ${snippet.snippetID}`),
                        snippetID : snippet.snippetID,
                        commentThreadID : commentThread.commentThreadID === undefined ? "" : commentThread.commentThreadID
                    });
                }
            });
            this.setState({
                snippets,
                commentThreads : threads
            });
        } catch (err) {
            if (err instanceof JsonFetchError) {
                // TODO: Handle error for the user
                console.log(err);
            } else {
                throw err;
            }
        }
	}

	/**
	 * Initialization when editor is created.
	 */
	initialize() {
		this.codeMirror.setSize('100%', '100%');

		// Highlight comments
		this.highlightComments();

		// Give line numbers id's
		this.setLineIds();
	}

	/**
	 * Add Id's to line in the code to allow #lineNumber in the url
	 */
	setLineIds() {
		const codeLines = document.getElementsByClassName("CodeMirror-code")[0].childNodes;
		let lineNumber = 1;
		for (const codeLine of codeLines) {
			(codeLine as Element).id = `${lineNumber++}`;
		}
	}

	/**
	 * Highlights comments passed to the code viewer.
	 */
	highlightComments() {
		let color = '#dc3339';
		const opacityRange = ['00', '6F', 'BF', 'FF'];

		if (this.state.snippets != undefined) {
			let highlights = new Map();
			for (const {startLine, startCharacter, endLine, endCharacter} of this.state.snippets) {
				if (startLine == undefined) continue;

				for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
					const line : string = this.codeMirror.getDoc().getLine(lineNumber);
					const length : number = line.length;

					let startChar = (lineNumber == startLine) ? startCharacter : 0;
					const endChar = (lineNumber == endLine) ? endCharacter : length;

					for (; startChar <= endChar; startChar += 1) {
						const location = `${lineNumber}-${startChar}`;
						const currentHighlights = highlights.get(location);
						const updatedHighlights = (currentHighlights == undefined) ? 1 : currentHighlights + 1;

						highlights.set(location, updatedHighlights);
					}
				}
			}

			for (const entry of highlights.entries()) {
				const [line, ch] : string[] = entry[0].split("-");

				const startLocation : {line : number, ch : number} = {line : parseInt(line), ch : parseInt(ch)};
				const endLocation : {line : number, ch : number} = { line : startLocation.line, ch : startLocation.ch + 1};

				const highlights = Math.min(entry[1], opacityRange.length - 1);
				const opacity = opacityRange[highlights];

				this.codeMirror.markText(
					startLocation,
					endLocation,
					{
						css: `background-color: ${color}${opacity};`}
				);
			}
		}
	}

	/**
	 * Handles selection changes
	 * @param editor, codemirror editor instance
	 * @param data, data from the selection
	 */
	onSelection(editor : Editor, data : any) {

		// Store comment ranges
		const head : CodeMirror.Position = data.ranges[0].head;
		const anchor : CodeMirror.Position = data.ranges[0].anchor;
		this.setCommentRanges(head, anchor);

		const startPosition = {line : this.state.commentStartLine, ch : this.state.commentStartCharacter};
		const endPosition = {line : this.state.commentEndLine, ch : this.state.commentEndCharacter};
		const formattedSelection = editor.getRange(startPosition, endPosition, '\r\n');

		this.setState({
			commentSelection : formattedSelection
		});
	};

	/**
	 * Compare head/anchor objects as these do not have to be in order
	 * @param a, first head/anchor object
	 * @param b, second head/anchor object
	 */
	compareRanges(a : any, b : any) {
		return (a.line != b.line) ? a.line - b.line : a.ch - b.ch;
	}

	/**
	 * If a comment was created, set the range in the state.
	 * @param head, start of the selection
	 * @param anchor, end of the selection
	 */
	setCommentRanges(head : any, anchor : any) {
		// Sort head / anchor
		let ranges = [head, anchor];
		ranges.sort(this.compareRanges);

		// Store comment ranges
		this.setState({
			commentStartLine : ranges[0].line,
			commentStartCharacter : ranges[0].ch,
			commentEndLine : ranges[1].line,
			commentEndCharacter : ranges[1].ch
		});
	}

	/**
	 * Handle clicks in the code viewer.
	 * @param editor, codemirror object instance
	 * @param event, type of event
	 */
	onClick(editor : Editor, event : any) {
		if (!this.state.selecting) {
			setTimeout(() => {
				const line = editor.getCursor().line;
				const character = editor.getCursor().ch;

				this.clickComment(line, character);
			}, 10);
		}
	}

	/**
	 * Handle click in the code canvas. Pass line and character of the cursor click.
	 * Loops throught the comments to check whether a comment was clicked. If this is
	 * the case the first comment will have its onClick method called.
	 *
	 * @param line, line number of the click
	 * @param character, character location in the line of the click
	 */
	clickComment(line : number, character : number) {
		const snippets : FileSnippet[] | undefined = this.state.snippets;
		if (snippets == undefined) return;

		// Find earliest comment that was clicked
		let first : FileSnippet | undefined;
		for (const snippet of snippets) {
			const {startLine, startCharacter, endLine, endCharacter} = snippet;
			if ((startLine < line || (startLine == line && startCharacter <= character)) &&
				(line < endLine || (line == endLine && character <= endCharacter))) {
				if (first == undefined || startLine < first.startLine || (startLine == first.startLine && startCharacter < first.startCharacter)){
					first = snippet;
				}
			}
		}

		// Call on click for comment
		if (first != undefined) first.onClick();
	}

	/**
	 * Change between creating / not creating a comment
	 * Setting selecting to true causes comment clicks to be ignored
	 * @param selecting, whether user is currently selecting a comment
	 */
	setSelecting(selecting : boolean) {
		this.setState({
			selecting : selecting
		});
	}

	/**
	 * Create a comment
	 */
	async addComment(comment : string) {
		const fileID = this.props.fileID;
		const submissionID = this.props.submissionID;
        
        try {
		    await createFileCommentThread(fileID, {
                submissionID,
                lineStart : this.state.commentStartLine,
                lineEnd : this.state.commentEndLine,
                charStart : this.state.commentStartCharacter,
                charEnd : this.state.commentEndCharacter,
                body : comment
            });
        } catch (err) {
            if (err instanceof JsonFetchError) {
                // TODO: handle error for the user
                console.log(err);
            } else {
                throw err;
            }
        }
	}

	render() {
		return (
			<div>
				<CodeMirror
					value = {this.state.formattedCode}
					options = {{
						mode : 'clike',
						theme : 'base16-light',
						lineNumbers : true
					}}
					editorDidMount={
						editor => {
							this.codeMirror = editor;
							this.initialize();
						}
					}
					onBeforeChange={(editor, data, value) => {
						// uncomment if we allow changes to be made
						/*this.setState({
						 formattedCode : value
						 });*/
					}}
					onSelection={this.onSelection}
					onMouseDown={this.onClick}
					onTouchStart={this.onClick}
					onChange={(editor, data, value) => {}}
				/>
				{
					this.state.selecting ?
						<div>
							<Button id='cancelComment' onClick={() => this.setSelecting(false)}>Cancel</Button>
							<h4>Code Snippet</h4>
							<textarea value={this.state.commentSelection} />
							<WriteComment placeholder="Write a comment" newCommentCallback={(text : string) => this.addComment(text)}/>
						</div>
						:
						<div>
							<Button id='createComment' onClick={() => this.setSelecting(true)}>Add comment</Button>
						</div>
				}
			</div>
		)
	}
}

export default CodeViewer2;