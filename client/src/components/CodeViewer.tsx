import React, { Component, Ref, TextareaHTMLAttributes, useImperativeHandle } from "react";
import "../styles/prism.scss"
import "codemirror/lib/codemirror.css"
import "codemirror/theme/oceanic-next.css"
import 'codemirror/mode/clike/clike.js';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/search/jump-to-line.js';
import CodeMirror from "codemirror";

type CodeViewerProps = {
    commentLineNumber: number;
    fileViewerRef: Ref<any>;
    file: any;
    updateLineNumber: Function;
};
class CodeViewer extends React.Component {
    movedByMouse: boolean = false;
    state: { file: any, formattedCode: any, updateLineNumber: Function, commentLineNumber: number};
    codeMirror: CodeMirror.Editor ;
    constructor(props: CodeViewerProps) {
        super(props);
        this.state = {
            file: props.file,
            updateLineNumber: props.updateLineNumber,
            formattedCode: props.file.body,
            commentLineNumber: props.commentLineNumber
        }

    }
    componentDidUpdate(props){
        if(props.file != this.state.file){
            this.codeMirrorUpdate();
        }
        this.selectLine();
    }

    componentDidMount(){
        this.codeMirrorUpdate();
        this.selectLine();
    }




    codeMirrorUpdate(){
        let tae: any = document.getElementById('text-editor');
        this.codeMirror = CodeMirror.fromTextArea(tae, {mode: 'text/x-java', lineNumbers: true ,styleActiveLine:true, theme: 'oceanic-next', value: this.state.formattedCode }, )
        this.codeMirror.setSize("100%", "100%");
        this.codeMirror.on("cursorActivity",(hint:any)=>{
            if(this.movedByMouse){
                this.setStateSelectedLine();
            }
        });
        this.codeMirror.on("mousedown", (hint:any)=> {
            this.movedByMouse = true;
        });
    }

    selectLine(){
        this.movedByMouse = false;
        this.codeMirror.setCursor(this.state.commentLineNumber -1 );
    }


    setStateSelectedLine(){
        let doc: any = this.codeMirror.getDoc();
        let anchor = doc.sel.ranges[0].anchor.line;
        let head = doc.sel.ranges[0].head.line;
        let lineNumber = (anchor > head) ? head : anchor;       
      this.state.updateLineNumber(lineNumber - 1);
    }

    //TODO refactor for React v17
    UNSAFE_componentWillReceiveProps(props: CodeViewerProps) {
        this.setState({
            file: props.file,
            commentLineNumber: props.commentLineNumber,
           formattedCode: props.file.body,
        },
    )}

    render() {
        return (
            <div>
                <textarea  id="text-editor" autoComplete='off' value ={ this.state.formattedCode}  />
            </div>

        );
    }
}

export default CodeViewer;