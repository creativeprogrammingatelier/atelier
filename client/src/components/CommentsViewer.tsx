import React, {Component, ReactElement} from 'react';
import Axios from 'axios';
import AuthHelper from '../../helpers/AuthHelper';
import CommentHelper from '../../helpers/CommentHelper';
import CommentView from './CommentView';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import CommentCreator from './CommentCreator';
//@ts-ignore
import io from 'socket.io-client';
import CodeViewer from './CodeViewer';
import {IComment} from '../../../models/comment';
import {IFile} from '../../../models/file';


type CommentViewerProps = {updateCurrentLineNumber: Function, currentLineNumber: number, file: IFile}
type CommentsViewerState = {file: IFile, currentLineNumber: number, comments: IComment[], commentCreatorToggle: boolean, updateCurrentLineNumber: Function}


class CommentsViewer extends React.Component<CommentViewerProps, CommentsViewerState> {
	private readonly commentRefreshFrequency = 1000;

	constructor(props: CommentViewerProps) {
		super(props);
		this.state = {
			file: props.file,
			updateCurrentLineNumber: props.updateCurrentLineNumber,
			currentLineNumber: (props.currentLineNumber) ? props.currentLineNumber : 0,
			commentCreatorToggle: false,
			comments: []
		};
		this.fetchComments();
	}

	//TODO refactor for React v17
	UNSAFE_componentWillReceiveProps(props: CommentViewerProps) {
		this.setState({
				file: props.file,
				currentLineNumber: props.currentLineNumber
			}, () => this.fetchComments()
		);
	}

	componentDidMount = () => {
		const socket = io();
		//@ts-ignore
		socket.on(this.props.file.id, (data: any) => {
			let newComments: IComment[] | undefined = this.state.comments;
			if (data.type === 'put') {
				newComments.push(data.comment);
				let sortedComments = newComments.sort(CommentsViewer.sortComments);
				this.setState({
					comments: sortedComments
				});
			} else {
				newComments = CommentsViewer.removeComment(newComments, data.comment);
				if (newComments != undefined) {
					let newCommentsDefined: IComment[] = newComments;
					let sortedComments = newCommentsDefined.sort(CommentsViewer.sortComments);
					this.setState({
						comments: sortedComments
					});
				}
			}
		});
	};

	static removeComment(comments: IComment[], commentToRemove: IComment) {
		for (let index = 0; index < comments.length; index++) {
			const comment = comments[index];
			if (comment._id === commentToRemove._id) {
				comments.splice(index, 1);
				return comments;
			}
		}
	}

	static sortComments(a: IComment, b: IComment) {
		let aDate = new Date(a.created);
		let bDate = new Date(b.created);

		if (aDate < bDate) {
			return 1;
		}
		if (aDate > bDate) {
			return -1;
		}
		return 0;

	}

	fetchCommentsHideCommentCreator = () => {
		this.setState({
			commentCreatorToggle: false
		});
	};

	fetchComments = (hideCommentCreator?: boolean) => {
		CommentHelper.getFileComments(this.state.file.id, (comments: IComment[]) => {
				let sortedComments = comments.sort(CommentsViewer.sortComments);
				this.setState({
					comments: sortedComments,
					commentCreatorToggle: (hideCommentCreator) ? false : this.state.commentCreatorToggle
				});
			}

			, (error: Error) => console.log(error));
	};

	deleteComment = (commentId: String) => {
		CommentHelper.deleteComment(commentId, () => this.fetchComments, () => alert('Failed to delete Comment'));
	};

	createTimercheckforNewComments() {
		setInterval(
			() => this.fetchComments(),
			this.commentRefreshFrequency
		);
	}

	populate = () => {
		let comments = [];
		if (this.state.comments != null) {
			for (const comment of this.state.comments) {
				comments.push(
					<li className="list-group-item" key={comment._id}><CommentView updateCurrentLineNumber={this.state.updateCurrentLineNumber} comment={comment} deleteComment={this.deleteComment}/>
					</li>
				);
			}
		}
		return comments;
	};

	render() {
		return (
			<div className="CommentViewer">
                <span onClick={(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => this.setState({
	                commentCreatorToggle: !this.state.commentCreatorToggle
                })}><FontAwesomeIcon icon={faPlus}/> New Comment</span>
				<div>
					{(this.state.commentCreatorToggle ?
						<CommentCreator currentLineNumber={this.state.currentLineNumber} onSuccess={this.fetchCommentsHideCommentCreator} fileId={this.props.file.id}/> : null)}
				</div>
				<ul className="list-group">
					{this.populate()}
				</ul>
			</div>

		);
	}
}

export default CommentsViewer;