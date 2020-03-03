import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSave} from '@fortawesome/free-solid-svg-icons';
import CommentHelper from '../../helpers/CommentHelper';
import '../styles/comment-creator.scss';


type CommentCreatorProps = {currentLineNumber: number, onSuccess: Function, fileId: String};
type CommentCreatorState = {currentLineNumber: number, commentBody: String, lineNum?: Number}


class CommentCreator extends React.Component<CommentCreatorProps, CommentCreatorState> {
	constructor(props: CommentCreatorProps) {
		super(props);
		this.state = {
			commentBody: '',
			currentLineNumber: props.currentLineNumber
		};
	}

	static getDerivedStateFromProps(nextProps: CommentCreatorProps, prevState: CommentCreatorState) {
		return {currentLineNumber: nextProps.currentLineNumber};
	}

	handleChange = (event: {target: {value: number | String, name: string}}) => {
		const {value, name} = event.target;
		this.setState({
			[name]: value
		} as unknown as Pick<CommentCreatorState, keyof CommentCreatorState>);

	};

	submit = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.preventDefault();
		let body: any = {
			fileId: this.props.fileId,
			comment: this.state.commentBody,
			line: (this.state.currentLineNumber) ? this.state.currentLineNumber : undefined
		};
		CommentHelper.putComment(body, this.props.onSuccess, () => alert('Failed, to fetch Comments'));
	};

	render() {
		return (
			<div className="form-group">
				<div className="toast" role="alert" aria-live="assertive" aria-atomic="true">
					<div className="toast-header">
						<strong className="mr-auto">New Comment</strong>
						<div className="save-comment-btn">
							<div onClick={this.submit}>
								<FontAwesomeIcon icon={faSave}/>
							</div>
						</div>
					</div>
					<div className="toast-body">
						<div>
							<div className="form-group">
								<input type="number" className="form-control" value={this.state.currentLineNumber} name="currentLineNumber" placeholder="About Line" onChange={this.handleChange}/>
							</div>
							<div className="form-group">
								<textarea name="commentBody" className="form-control" placeholder="Comment" onChange={this.handleChange}/>
							</div>
							<div className="form-group">

							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
export default CommentCreator;