import * as React from "react";
import { Route, Switch } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { throws } from "assert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import CommentHelper from "../../helpers/CommentHelper";
import "../styles/comment-creator.scss"
type CommentCreatorProps = {onSuccess: Function, fileId: String};
class CommentCreator extends React.Component<CommentCreatorProps> {
    state:{commentBody: String, lineNum?: Number}
    constructor(props: CommentCreatorProps){
        super(props);
        this.state = {
            commentBody: ""
        }
    }
    
    handleChange = (event: { target: { value: any; name: any; }; }) => {
            const { value, name } = event.target;
            this.setState({
                [name]: value
            })
        };

    submit = (event:any) => {
        event.preventDefault();
        let body = {
            fileId: this.props.fileId,
            comment: this.state.commentBody,
            line: (this.state.lineNum) ? this.state.lineNum: undefined
        }
        CommentHelper.putComment(JSON.stringify(body), this.props.onSuccess, ()=> alert("Failed, to fetch Comments"))
    }

    render() {
        return (
            <div className="form-group">
                <div className="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="toast-header">
                        <strong className="mr-auto">New Comment</strong>                             
                        <div className="save-comment-btn">
                                <div onClick={this.submit}>
                                    <FontAwesomeIcon icon={faSave} />
                                </div>
                            </div>
                    </div>
                    <div className="toast-body">
                        <div>
                        <div className="form-group">
                            <input type="number" className="form-control" name = "lineNum" placeholder="About Line" onChange={this.handleChange} /> 
                        </div>
                        <div className="form-group">
                            <textarea  name = "commentBody" className="form-control" placeholder="Comment" onChange={this.handleChange} /> 
                        </div>            
                        <div className="form-group">

                        </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
} export default CommentCreator;