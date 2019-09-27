import React, { Component } from "react";
import "../styles/prism.scss"

class CodeViewer extends React.Component {
    //TODO make a object defintion for file
    state: { file: any, formattedCode: any };
    constructor(props: { file: any }) {
        super(props);
        this.state = {
            file: props.file,
            formattedCode: this.beutifyCode(props.file)
        }
    }

    //TODO refactor for React v17
    UNSAFE_componentWillReceiveProps(props: any) {
        this.setState({
            file: props.file,
            formattedCode: this.beutifyCode(props.file)
        }); 
    }

    beutifyCode = (file:any):any => {
        const Prism = require('../lib/prism.js');
        return Prism.highlight(file.body, Prism.languages.processing, 'processing');

    }
    render() {
        return (
            <div>
                <pre className="line-numbers">
                    <code className="language-processing line-numbers" dangerouslySetInnerHTML={{ __html:(this.state.formattedCode? this.state.formattedCode: null) }}/>
                </pre>
            </div>
        );
    }
}

export default CodeViewer;