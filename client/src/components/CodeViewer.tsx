import React, { Component } from "react";
import '../styles/prism.css';
class CodeViewer extends React.Component {
    //TODO make a object defintion for file
    state: { file: any }
    constructor(props: { file: any }) {
        super(props);
        this.state = {
            file: props.file
        }
    }
    componentWillReceiveProps(props: any) {
        this.setState({
            file: props.file

        }
        )
    }

    beautifyCode = (): string => {
        let Prism = require('../lib/prism.js');
        return Prism.highlight(this.state.file.body, Prism.languages.processing, 'processing');
    }
    render() {
        return (
            <div>
                <pre><code className="language-css" dangerouslySetInnerHTML={{ __html: this.beautifyCode() }}></code></pre>
            </div>
        );
    }
}

export default CodeViewer;