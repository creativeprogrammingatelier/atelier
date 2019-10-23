import React, { Component, ReactElement } from "react";
import Axios from "axios";
import AuthHelper from "../../helpers/AuthHelper";
import CommentHelper from "../../helpers/CommentHelper";
import CommentView from "./CommentView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import CommentCreator from "./CommentCreator";
import io from 'socket.io-client';
import CodeViewer from "./CodeViewer";
class CommentsViewer extends React.Component<{ file: any }>  {
    //TODO make a object defintion for file
    state: { file: any, currentLineNumber: number, comments: any[], commentCreatorToggle: boolean, updateCurrentCursorLine: Function }
    private readonly commentFreshFrequency = 1000;

    constructor(props: {updateCurrentCursorLine: Function, currentLineNumber: number, file: any, codeViewerRef:  React.RefObject<CodeViewer> }) {
        super(props);
        this.state = {
            file: props.file,
            updateCurrentCursorLine: props.updateCurrentCursorLine,
            currentLineNumber: (props.currentLineNumber) ?  props.currentLineNumber : 0,
            commentCreatorToggle: false,
            comments: []
        }
        this.fetchComments()
    }
    
    //TODO refactor for React v17
    UNSAFE_componentWillReceiveProps(props: any) {
        this.setState({
            file: props.file,
            currentLineNumber: props.currentLineNumber
        }, () => this.fetchComments()
        )
    }

    componentDidMount= () => {
        const socket = io();
        socket.on(this.props.file.id, (data) => {
            let newComments: any[] = this.state.comments;
            if(data.type === "put"){
                newComments.push(data.comment);
                let sortedComments = newComments.sort(CommentsViewer.sortComments);
                this.setState({
                    comments: newComments
                });
            } else{
                newComments = CommentsViewer.removeComment(newComments, data.comment);
                let sortedComments = newComments.sort(CommentsViewer.sortComments);
                this.setState({
                    comments: sortedComments
                });
            }
        })
    }

    static removeComment(comments, commentToRemove) {
        for (let index = 0; index < comments.length; index++) {
            const comment = comments[index];
            if(comment._id === commentToRemove._id){
                comments.splice(index, 1)
                return comments;
            } 
        }
    }

    static sortComments(a,b){
        let aDate = new Date(a.created);
        let bDate = new Date(b.created);

        if ( aDate < bDate ){
            return 1;
        }
        if ( aDate > bDate ){
            return -1;
        }
        return 0;
          
    }

    fetchCommentsHideCommentCreator = () => {
        this.setState({
            commentCreatorToggle: false
        })
    }

    fetchComments = (hideCommentCreator? : boolean) => {
        CommentHelper.getFileComments(this.state.file.id, (comments: any) => 
        {
            let sortedComments = comments.sort(CommentsViewer.sortComments);
            this.setState({
                comments: sortedComments,
                commentCreatorToggle: (hideCommentCreator) ? false: this.state.commentCreatorToggle
            })
        }
        
        , (error: any) => console.log(error))
    }

    deleteComment = (commentId: String) =>{
        CommentHelper.deleteComment(commentId, () => this.fetchComments, () => alert("Failed to delete Comment"))
    }

    createTimercheckforNewComments() {
        setInterval(
            () => this.fetchComments(),
            this.commentFreshFrequency
        )
    } 

    populate = () => {
        let comments = [];
        if (this.state.comments != null) {
            for (const comment of this.state.comments) {
                comments.push(
                    <li className="list-group-item" key={comment._id}> <CommentView updateCurrentCursorLine ={this.state.updateCurrentCursorLine} comment = {...comment} deleteComment ={this.deleteComment} /></li>
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
                })}><FontAwesomeIcon icon={faPlus}/> New Comment</span>
                <div>
                    {(this.state.commentCreatorToggle? <CommentCreator currentLineNumber={this.state.currentLineNumber} onSuccess={this.fetchCommentsHideCommentCreator} fileId={this.props.file.id}/>: null)}
                </div>
                <ul className="list-group"> 
                    {this.populate()}
                </ul>
            </div>

        );
    }
}

export default CommentsViewer;