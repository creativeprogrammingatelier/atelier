import React, { Component, Ref, TextareaHTMLAttributes, useImperativeHandle } from "react";
import "../styles/prism.scss"
import "codemirror/lib/codemirror.css"
import "codemirror/theme/oceanic-next.css"
import 'codemirror/mode/clike/clike.js';
import 'codemirror/addon/selection/active-line';
import CodeMirror from "codemirror";

class CodeViewer extends React.Component {
    //TODO make a object defintion for file
    state: { file: any, formattedCode: any, updateLineNumber: Function};
    codeMirror: CodeMirror.Editor ;
    constructor(props: { fileViewerRef: Ref<any>, file: any, updateLineNumber: Function }) {
        super(props);
        this.state = {
            file: props.file,
            updateLineNumber: props.updateLineNumber,
            formattedCode: props.file.body
        }

    }
    componentDidMount(){
        this.codeMirrorUpdate();

    }

    codeMirrorUpdate(){
        let tae: any = document.getElementById('text-editor');
        this.codeMirror = CodeMirror.fromTextArea(tae, {mode: 'text/x-java', lineNumbers: true ,styleActiveLine:true, theme: 'oceanic-next', value: this.state.formattedCode }, )
        this.codeMirror.on("cursorActivity",(hint:any)=>{
            this.setSelectedLine();
        });
    }

    setSelectedLine(){
        let doc: any = this.codeMirror.getDoc();
        let anchor = doc.sel.ranges[0].anchor.line;
        let head = doc.sel.ranges[0].head.line;
        let lineNumber = (anchor > head) ? head : anchor;
        this.state.updateLineNumber(lineNumber + 1);
    }


    //TODO refactor for React v17
    UNSAFE_componentWillReceiveProps(props: any) {
        this.setState({
            file: props.file,
            formattedCode: props.file.body
        }); 
    }

    render() {
        return (

            <textarea  id="text-editor" autoComplete='off' value ={ this.state.formattedCode}  />

        );
    }
}

export default CodeViewer;