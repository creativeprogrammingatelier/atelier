import React from 'react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/oceanic-next.css';
import 'codemirror/mode/clike/clike.js';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/search/jump-to-line.js';
import {Controlled as CodeMirror} from 'react-codemirror2';
import {IFile} from '../../../models/file';
import {FileComment} from "./submission/CodeTab";
import {Editor} from "codemirror";
import {WriteComment} from "./commentthread/WriteComment";

type CodeViewer2Props = {
    file : IFile,
    comments? : FileComment[]
}

type CodeViewer2State = {
    formattedCode : string,
    selecting : boolean,
    commentSelection : string,

    comments : FileComment[],

    commentStartLine : number,
    commentStartCharacter : number,
    commentEndLine : number,
    commentEndCharacter : number
}

const fileComments : FileComment[] = [
    {
        startLine : 1,
        startCharacter : 0,
        endLine : 1,
        endCharacter : 3,
        onClick : () => console.log("clicked comment 1"),
        commentID : 1
    },
    {
        startLine : 3,
        startCharacter : 0,
        endLine : 4,
        endCharacter : 3,
        onClick : () => console.log("clicked comment 2"),
        commentID : 2
    },
    {
        startLine : 1,
        startCharacter : 5,
        endLine : 1,
        endCharacter : 30,
        onClick : () => console.log("clicked comment 3"),
        commentID : 3
    }
];

class CodeViewer2 extends React.Component<CodeViewer2Props, CodeViewer2State> {
    codeMirror!: CodeMirror.Editor;


    constructor(props : CodeViewer2Props) {
        super(props);

        this.state = {
            formattedCode : props.file.body,
            selecting : false,
            commentSelection : "",

            comments : [],

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
    }

    componentDidUpdate(prevProps: Readonly<CodeViewer2Props>, prevState: Readonly<CodeViewer2State>, snapshot?: any): void {
        if (this.state.comments !== prevState.comments) {
            this.highlightComments();
        }
    }

    /**
     * Initialization when editor is created.
     */
    initialize() {
        this.codeMirror.setSize('100%', '100%');

        // Retrieve comments
        // TODO get comments from the database
        this.setState({
           comments : fileComments
        });

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
        // @Cas colors and opacity that are being looped through
        let colorIndex = 0;
        let colors = ['#DCDCDC', '#D3D3D3', '#C0C0C0', '#A9A9A9', '#808080'];
        let opacity = '7f';

        if (this.state.comments != undefined) {
            console.log("highlighting: " + this.state.comments.length + " comments");
            for (const {startLine, startCharacter, endLine, endCharacter} of this.state.comments) {
                this.codeMirror.markText(
                    {line : startLine - 1, ch: startCharacter},
                    {line : endLine - 1, ch : endCharacter},
                    {css: `background-color: ${colors[colorIndex] + opacity};`}
                );
                colorIndex = (colorIndex + 1) % colors.length;
            }
        }
    }

    /**
     * Handles selection changes
     * @param editor, codemirror editor instance
     * @param data, data from the selection
     */
    onSelection(editor : Editor, data : any) {
        // Store comment selection
        this.setState({
            commentSelection : editor.getSelection()
        });

        // Store comment ranges
        const head = data.ranges[0].head;
        const anchor = data.ranges[0].anchor;

        this.setCommentRanges(head, anchor);
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

        console.log(`Current comment: ${this.state.commentStartLine}:${this.state.commentStartCharacter}-${this.state.commentEndLine}:${this.state.commentEndCharacter}: ${this.state.commentSelection}`);
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

                // Check if comment was clicked. Line increased by 1 for editor.
                this.clickComment(line + 1, character);
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
        const comments : FileComment[] | undefined = this.state.comments;
        if (comments == undefined) return;

        // Find earliest comment that was clicked
        let first : FileComment | undefined;
        for (const comment of comments) {
            const {startLine, startCharacter, endLine, endCharacter, commentID} = comment;
            if ((startLine < line || (startLine == line && startCharacter <= character)) &&
                (line < endLine || (line == endLine && character <= endCharacter))) {
                if (first == undefined || startLine < first.startLine || (startLine == first.startLine && startCharacter < first.startCharacter)){
                    first = comment;
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
    addComment(comment : string) {
        let fileComments = this.state.comments;

        const commentID : number = Math.random();
        fileComments.push({
           startLine : this.state.commentStartLine + 1,
           startCharacter : this.state.commentStartCharacter,
           endLine : this.state.commentEndLine + 1,
           endCharacter : this.state.commentEndCharacter,
           onClick : () => console.log("clicked comment " + commentID),
           commentID : commentID
        });

        console.log(`made comment ${comment}`);


        this.setState({
           comments : fileComments,
           selecting : false
        });

        this.highlightComments();


        // TODO call database
    }

    render() {
        return (
            <div>
                <CodeMirror
                    value = {this.state.formattedCode}
                    options = {{
                        // .pde is not supported : https://codemirror.net/mode/
                        // TODO implement pde language support?
                        mode : 'java',
                        // @Cas pick a theme
                        theme : 'material',
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
                            <button id='cancelComment' onClick={() => this.setSelecting(false)}>Cancel</button>
                            <h4>Code Snippet</h4>
                            <p>{this.state.commentSelection}</p>
                            <WriteComment newCommentCallback={(text : string) => this.addComment(text)}/>
                        </div>
                        :
                        <div>
                            <button id='createComment' onClick={() => this.setSelecting(true)}>Add comment</button>
                        </div>
                }
            </div>
        )
    }
}

export default CodeViewer2