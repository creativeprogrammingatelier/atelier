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
import { JsonFetchError } from '../../helpers/FetchHelper';
import { getFileComments, createFileCommentThread } from '../../helpers/APIHelper';
import { Range, getRanges } from "../helpers/HighlightingHelper";
import {CommentThread} from "../../../models/api/CommentThread";
import { withRouter } from 'react-router-dom';

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
	commentThreads : CommentThread[],

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
            const snippets : FileSnippet[] = [];
            threads.map((commentThread : CommentThread) => {
                if (commentThread.snippet !== undefined) {
                    const snippet = commentThread.snippet;
                    snippets.push({
                        startLine : snippet.start.line,
                        startCharacter : snippet.start.character,
                        endLine : snippet.end.line,
                        endCharacter : snippet.end.character,
                        onClick : () => {
                        	console.log("clicked comment");
							const submissionID : string = this.props.submissionID;
							const fileID : string = this.props.fileID;
							const threadID : string = commentThread.ID;
							const path : string = `/submission/${submissionID}/${fileID}/comments#${threadID}`;
							// @ts-ignore It actually is there
							this.props.history.push(path);
						},
                        snippetID : snippet.ID,
						commentThreadID : commentThread.ID
                    });
                }
            });
            this.setState({
                snippets,
                commentThreads : threads
            });
        } catch (err) {
            if (err instanceof JsonFetchError) {
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

		/** Highlight based on ranges*/
		if (this.state.snippets != undefined) {
			const ranges : Range[] = this.state.snippets.map(snippet => {
				return {
					startLine : snippet.startLine,
					startChar : snippet.startCharacter,
					endLine : snippet.endLine,
					endChar : snippet.endCharacter,
					overlap : 1
				}
			});

			const highlightRanges : Range[] = getRanges(ranges);
			for (const {startLine, startChar, endLine, endChar, overlap} of highlightRanges) {
				const opacity = opacityRange[Math.min(overlap, opacityRange.length - 1)];

				this.codeMirror.markText(
					{line : startLine, ch : startChar},
					{line : endLine, ch : endChar},
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
		const snippetBody : string | undefined = (this.state.commentSelection == "") ? undefined : this.state.commentSelection;

		console.log("Snippet body: " + snippetBody);
		console.log("Line start: " + this.state.commentStartLine);
		console.log("Line end: " + this.state.commentEndLine);
		console.log("Char start: " + this.state.commentStartCharacter);
		console.log("Char end: " + this.state.commentEndCharacter);
		console.log("Comment body: " + comment);
		console.log("SubmissionID: " + submissionID);
        
        try {
		    await createFileCommentThread(fileID, {
                snippetBody : snippetBody,
                lineStart : this.state.commentStartLine,
                lineEnd : this.state.commentEndLine,
                charStart : this.state.commentStartCharacter,
                charEnd : this.state.commentEndCharacter,
				commentBody : comment,
				submissionID : submissionID
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
					onBeforeChange={() => {
						// uncomment if we allow changes to be made
						/*this.setState({
						 formattedCode : value
						 });*/
					}}
					onSelection={this.onSelection}
					onMouseDown={this.onClick}
					onTouchStart={this.onClick}
					onChange={() => {}}
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

//@ts-ignore If someone knows how to fix this for typescript, pls do
const CodeViewer2WithRouter = withRouter(CodeViewer2);
export default CodeViewer2WithRouter;