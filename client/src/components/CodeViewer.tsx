import React, { Component, Ref, TextareaHTMLAttributes } from "react";
import "../styles/prism.scss"
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css"
import "codemirror/theme/oceanic-next.css"
import 'codemirror/mode/clike/clike.js';
class CodeViewer extends React.Component {
    //TODO make a object defintion for file
    state: { file: any, formattedCode: any };
    codeMirror: CodeMirror.Editor;
    constructor(props: { file: any }) {
        super(props);
        this.state = {
            file: props.file,
            formattedCode: props.file.body
        }
    }
    componentDidMount(){
        let tae: any = document.getElementById('text-editor');
        this.codeMirror = CodeMirror.fromTextArea(tae, {mode: 'text/x-java', lineNumbers: true, theme: 'oceanic-next', value: this.state.formattedCode }, )
    }
    componentDidUpdate(){
        let tae: any = document.getElementById('text-editor');
        this.codeMirror = CodeMirror.fromTextArea(tae, {mode: 'text/x-java', lineNumbers: true, theme: 'oceanic-next', value: this.state.formattedCode }, )
    }

    //TODO refactor for React v17
    UNSAFE_componentWillReceiveProps(props: any) {
        this.setState({
            file: props.file,
            formattedCode: props.file.body
        }); 
    }

    // beutifyCode = (file:any):any => {
    //     const Prism = require('../lib/prism.js');
    //     return Prism.highlight(file.body, Prism.languages.processing, 'processing');

    // }
    render() {
        return (
            // <div>
            //     <pre className="line-numbers">
            //         <code className="language-processing line-numbers" dangerouslySetInnerHTML={{ __html:(this.state.formattedCode? this.state.formattedCode: null) }}/>
            //     </pre>
            // </div>

            <textarea  id="text-editor" autoComplete='off' value ={ this.state.formattedCode}  />

        );
    }
}

export default CodeViewer;