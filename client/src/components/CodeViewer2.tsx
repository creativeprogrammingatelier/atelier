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
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { File } from '../../../models/api/File';

interface CodeViewer2Props extends RouteComponentProps {
	submissionID : string,
	file : File,
	fileContents : string
}

interface CodeViewer2State {
	formattedCode : string,
	selecting : boolean,
	commentSelection : string,

	snippets : FileSnippet[],
	commentThreads : CommentThread[],

    commentText : string
	commentStartLine : number,
	commentStartCharacter : number,
	commentEndLine : number,
	commentEndCharacter : number
}

interface SelectionRange { 
    head: CodeMirror.Position, 
    anchor: CodeMirror.Position 
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

            commentText : "",
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

	componentDidUpdate(prevProps: Readonly<CodeViewer2Props>, prevState: Readonly<CodeViewer2State>): void {
        if (this.state.commentThreads !== prevState.commentThreads) {
            const snippets : FileSnippet[] = [];
            this.state.commentThreads.map((commentThread : CommentThread) => {
                if (commentThread.snippet !== undefined) {
                    const snippet = commentThread.snippet;
                    snippets.push({
                        startLine : snippet.start.line,
                        startCharacter : snippet.start.character,
                        endLine : snippet.end.line,
                        endCharacter : snippet.end.character,
                        onClick : () => {
                        	console.log("clicked comment");
							const submissionID = this.props.submissionID;
							const fileID = this.props.file.ID;
							const threadID = commentThread.ID;
							const path = `/submission/${submissionID}/${fileID}/comments#${threadID}`;
							this.props.history.push(path);
						},
                        snippetID : snippet.ID,
						commentThreadID : commentThread.ID
                    });
                }
            });
            this.setState({ snippets });
        }
		if (this.state.snippets !== prevState.snippets) {
			this.highlightComments();
		}
	}

	async getCommentThreads() {
        try {
            const threads = await getFileComments(this.props.file.ID);
            this.setState({ commentThreads : threads });
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
		const color = '#dc3339';
		const opacityRange = ['00', '6F', 'BF', 'FF'];

		/** Highlight based on ranges */
		if (this.state.snippets !== undefined) {
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
	onSelection(editor : Editor, data : { ranges: SelectionRange[] }) {

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
	compareRanges(a : CodeMirror.Position, b : CodeMirror.Position) {
		return (a.line !== b.line) ? a.line - b.line : a.ch - b.ch;
	}

	/**
	 * If a comment was created, set the range in the state.
	 * @param head, start of the selection
	 * @param anchor, end of the selection
	 */
	setCommentRanges(head : CodeMirror.Position, anchor : CodeMirror.Position) {
		// Sort head / anchor
		const ranges = [head, anchor];
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
	onClick(editor : Editor, event : Event) {
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
		if (snippets === undefined) return;

		// Find earliest comment that was clicked
		let first : FileSnippet | undefined;
		for (const snippet of snippets) {
			const {startLine, startCharacter, endLine, endCharacter} = snippet;
			if ((startLine < line || (startLine === line && startCharacter <= character)) &&
				(line < endLine || (line === endLine && character <= endCharacter))) {
				if (first === undefined || startLine < first.startLine || (startLine === first.startLine && startCharacter < first.startCharacter)){
					first = snippet;
				}
			}
		}

		// Call on click for comment
		if (first !== undefined) first.onClick();
	}

	/**
	 * Change between creating / not creating a comment
	 * Setting selecting to true causes comment clicks to be ignored
	 * @param selecting, whether user is currently selecting a comment
	 */
	setSelecting(selecting : boolean) {
		this.setState({ selecting });
        if (!selecting) {
            // Clear the selection in the editor
            this.codeMirror.setSelection({ 
                line: this.state.commentStartLine, 
                ch: this.state.commentStartCharacter 
            });
        }
	}

	/**
	 * Create a comment
	 */
	async addComment() {
		const fileID = this.props.file.ID;
		const submissionID = this.props.submissionID;
		const snippetBody : string | undefined = (this.state.commentSelection === "") ? undefined : this.state.commentSelection;

		console.log("Snippet body: " + snippetBody);
		console.log("Line start: " + this.state.commentStartLine);
		console.log("Line end: " + this.state.commentEndLine);
		console.log("Char start: " + this.state.commentStartCharacter);
		console.log("Char end: " + this.state.commentEndCharacter);
		console.log("Comment body: " + this.state.commentText);
		console.log("SubmissionID: " + submissionID);
        
        try {
            const thread = await createFileCommentThread(fileID, {
                submissionID,
                snippetBody,
                lineStart : this.state.commentStartLine,
                lineEnd : this.state.commentEndLine,
                charStart : this.state.commentStartCharacter,
                charEnd : this.state.commentEndCharacter,
				commentBody : this.state.commentText
            });
            this.setSelecting(false);
            this.setState(state => ({ 
                commentText: "", 
                commentThreads: state.commentThreads.concat(thread) 
            }));
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
                            <WriteComment 
                                courseID={this.props.file.references.courseID}
                                placeholder="Write a comment" 
                                text={this.state.commentText} 
                                updateText={commentText => this.setState({ commentText })} />
                            <Button onClick={this.addComment}>Submit</Button>
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

const codeViewer2WithRouter = withRouter(CodeViewer2);
export { codeViewer2WithRouter as CodeViewer2 };