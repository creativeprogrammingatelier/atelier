import React, { Component, ReactElement } from "react";
import Axios from "axios";
import AuthHelper from "../../helpers/AuthHelper";
import CommentHelper from "../../helpers/CommentHelper";
import CommentView from "./CommentView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import CommentCreator from "./CommentCreator";
class CommentsViewer extends React.Component<{ file: any }>  {
    //TODO make a object defintion for file
    state: { file: any, comments?: any[], commentCreatorToggle: boolean }
    constructor(props: { file: any }) {
        super(props);
        this.state = {
            file: props.file[0],
            commentCreatorToggle: false
        }
        this.fetchComments()
    }
    
    //TODO refactor for React v17
    UNSAFE_componentWillReceiveProps(props: any) {
        this.setState({
            file: props.file
        }, () => this.fetchComments()
        )

    }

    fetchComments = () => {
        CommentHelper.getFileComments(this.props.file._id, (comments: any) => this.setState({
            comments: comments,
            commentCreatorToggle: false
        }), (error: any) => console.error(error))
    }

    deleteComment = (commentId: String) =>{
        CommentHelper.deleteComment(commentId, () => this.fetchComments(), () => alert("Failed to delete Comment"))
    }

    populate = () => {
        let comments = [];
        if (this.state.comments != null) {
            for (const comment of this.state.comments) {
                comments.push(
                    <li className="list-group-item" key={comment._id}> <CommentView comment = {...comment} deleteComment ={this.deleteComment} /></li>
                )
            }
        }
        return comments;
    }

    render() {
        return (
            <div className="CommentViewer">
                <span onClick={(e:any)=> this.setState({
                    commentCreatorToggle: !this.state.commentCreatorToggle
                })}><FontAwesomeIcon icon={faPlus}/></span>
                <div>
                    {(this.state.commentCreatorToggle? <CommentCreator onSuccess={this.fetchComments} fileId={this.props.file.id}/>: null)}
                </div>
                <ul className="list-group">
                    {this.populate()}
                </ul>
            </div>

        );
    }
}

export default CommentsViewer;