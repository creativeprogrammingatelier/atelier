import React, { Component } from "react";
import Prism from "prismjs";
class CodeViewer extends React.Component {
    //TODO make a object defintion for file
    state: { file: any }
    prismjsElement: React.RefObject<HTMLElement>;
    constructor(props: { file: any }) {
        super(props);
        this.state = {
            file: props.file
        }
        this.prismjsElement = React.createRef();
    }
    componentWillReceiveProps(props: any) {
        this.setState({
            file: props.file
        }
        )
    }

    beautifyCode = () => {
        Prism.highlightElement(this.prismjsElement.current)
    }
    render() {
        return (
            <div>
                <pre className="line-numbers">
                    <code ref={this.prismjsElement} className="language-processing" dangerouslySetInnerHTML={{ __html: this.state.file.body }}/>
                </pre>
            </div>
        );
    }
}

export default CodeViewer;