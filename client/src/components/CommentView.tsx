import * as React from "react";
type CommentType = { about: String, author: { email: String, role: String }, _id:String, body: String, created: Date, line: Number };
type CommentViewProps = {comment: CommentType, deleteComment: Function};
class CommentView extends React.Component<CommentViewProps> {

    constructor(props: CommentViewProps) {
        super(props)
    }
    render() {
        return (
            <div className="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-header">
                  <div className="container">
                        <div className="row">
                            <div className="col-sm">
                                <strong className="mr-auto">{this.props.comment.author.email}</strong>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm">
                                <small>{new Date(this.props.comment.created).toLocaleDateString("en-GB") }</small>
                            </div>
                            <div className="col-sm">
                                <small>Line: {this.props.comment.line}</small>
                            </div>
                        </div>
                    <button type="button" className="ml-2 mb-1 close"  data-dismiss="toast" aria-label="Close">
                        <span onClick={() => this.props.deleteComment(this.props.comment._id)} aria-hidden="true">&times;</span>
                    </button>
                    </div>
                </div>
                <div className="toast-body">
                {this.props.comment.body}
                </div>
            </div>

        )


    }
} export default CommentView;