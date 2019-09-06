import React, { Component } from "react";
import Axios from "axios";
import AuthHelper from "../../helpers/AuthHelper";
import CommentHelper from "../../helpers/CommentHelper";
import CommentView from "./CommentView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
class CommentsViewer extends React.Component<{ file: any }>  {
    //TODO make a object defintion for file
    state: { file: any, comments?: any[] }
    constructor(props: { file: any }) {
        super(props);
        this.state = {
            file: props.file,
        }
        this.fetchComments()
    }
    componentWillReceiveProps(props: any) {
        this.setState({
            file: props.file
        }, () => this.fetchComments()
        )

    }

    fetchComments = () => {
        console.log(this.props.file)
        CommentHelper.getComments(this.props.file.id, (comments: any) => this.setState({
            comments: comments
        }), (error: any) => console.log(error))
    }

    populate = () => {
        let comments = [];
        if (this.state.comments != null) {
            for (const comment of this.state.comments) {
                comments.push(
                    <li className="list-group-item"> <CommentView {...comment} /></li>
                )
            }
        }
        return comments;
    }

    render() {
        return (
            <div className="CommentViewer">
                <FontAwesomeIcon icon={faPlus}/>
                <ul className="list-group">
                    {this.populate()}
                </ul>
            </div>

        );
    }
}

export default CommentsViewer;