import React, { Component, Ref, TextareaHTMLAttributes, useImperativeHandle, DOMElement } from "react";
import "codemirror/lib/codemirror.css"
import "codemirror/theme/oceanic-next.css"
import 'codemirror/mode/clike/clike.js';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/search/jump-to-line.js';
import CodeMirror from "codemirror";
import { IFile } from "../../../models/file";

type CodeViewerProps = {
    commentLineNumber: number;
    file: IFile;
    updateLineNumber: Function;
};

type CodeViewerState = {
    file: IFile,
    formattedCode: string,
    updateLineNumber: Function,
    commentLineNumber: number
}

class CodeViewer extends React.Component<CodeViewerProps, CodeViewerState> {
    movedByMouse: boolean = false;
    codeMirror!: CodeMirror.Editor;

    constructor(props: CodeViewerProps) {
        super(props);
        this.state = {
            file: props.file,
            updateLineNumber: props.updateLineNumber,
            formattedCode: props.file.body,
            commentLineNumber: props.commentLineNumber
        }

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
                this.codeMirror = CodeMirror.fromTextArea(textEditor, { mode: 'text/x-java', lineNumbers: true, styleActiveLine: true, theme: 'oceanic-next', value: this.state.formattedCode })

            this.codeMirror.setSize("100%", "100%");
            this.codeMirror.on("cursorActivity", (instanceCodeMirror: CodeMirror.Editor) => {
                if (this.movedByMouse) {
                    this.setStateSelectedLine();
                }
            });
            this.codeMirror.on("mousedown", (instanceCodeMirror: CodeMirror.Editor) => {
                this.movedByMouse = true;
            });
        }
    }

    selectLine() {
        this.movedByMouse = false;
        this.codeMirror.setCursor(this.state.commentLineNumber - 1);
    }


    setStateSelectedLine() {
        let doc: any = this.codeMirror.getDoc();
        let anchor = doc.sel.ranges[0].anchor.line;
        let head = doc.sel.ranges[0].head.line;
        let lineNumber = (anchor > head) ? head : anchor;
        this.state.updateLineNumber(lineNumber - 1);
    }

    //https://hackernoon.com/replacing-componentwillreceiveprops-with-getderivedstatefromprops-c3956f7ce607
    static getDerivedStateFromProps(nextProps: CodeViewerProps, prevState: CodeViewerState) {
        return {
            file: nextProps.file,
            commentLineNumber: nextProps.commentLineNumber,
            formattedCode: nextProps.file.body,
        }
    }

    render() {
        return (
            <div>
                <textarea id="text-editor" autoComplete='off' value={this.state.formattedCode} />
            </div>

        );
    }
}

export default CodeViewer;