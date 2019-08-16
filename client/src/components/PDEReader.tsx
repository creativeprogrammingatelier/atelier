import React, { Component } from "react";


class PDEReader extends React.Component {
    //TODO make a object defintion for file
    state: { file: any }
    constructor(props: { file: any }) {
        super(props);

    }

    componentDidUpdate = () => {


    }

    render() {
        return (
            <div>
                <pre className="line-numbers">
                    <code className="language-processing">
                        {this.props.file.body}
                    </code>
                </pre>
            </div>
        );
    }
}

export default PDEReader;