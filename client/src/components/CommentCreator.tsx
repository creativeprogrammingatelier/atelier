import * as React from "react";
import { Route, Switch } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { throws } from "assert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import CommentHelper from "../../helpers/CommentHelper";
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
                        {/* <button type="button" className="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close" >
                            <span aria-hidden="true">&times;</span>
                        </button> */}
                    </div>
                    <div className="toast-body">
                        <div>
                            <input type="number" name = "lineNum" placeholder="About Line" onChange={this.handleChange} /> 
                            <textarea  name = "commentBody" placeholder="Comment" onChange={this.handleChange} /> 
                            <div onClick={this.submit}>
                                <FontAwesomeIcon icon={faSave} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
} export default CommentCreator;