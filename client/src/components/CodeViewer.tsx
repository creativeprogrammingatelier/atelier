import React, { Component } from "react";
import 'prismjs';
import Prism, { highlight } from "prismjs";

class CodeViewer extends React.Component {
    //TODO make a object defintion for file
    state: { file: any }
    constructor(props: { file: any }) {
        super(props);
        this.state = {
            file: props.file
        }

    }

    beautifyCode = (): string => {
        return highlight(this.state.file.body, Prism.languages.processing, 'processing');
    }
    render() {
        return (
            <code
                dangerouslySetInnerHTML={{ __html: this.beautifyCode() }}
            >
                {this.state.file.body}
            </code>
        );
    }
}

export default CodeViewer;