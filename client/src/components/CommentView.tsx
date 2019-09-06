import * as React from "react";
import { Route, Switch } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "./Home";
import Login from "./Login";
import AuthHelper from "../../helpers/AuthHelper";
import StudentView from "./StudentView";
import TAView from "./TAView";
import { throws } from "assert";
type CommentType = { about: String, author: { email: String, role: String }, body: String };
class CommentView extends React.Component<CommentType> {

    constructor(props: CommentType) {
        super(props)
    }
    render() {
        return (

            <div className="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-header">
                <img src="..." className="rounded mr-2" alt="..."/>
                <strong className="mr-auto">{this.props.author.email}</strong>
                <small>11 mins ago</small>
                <button type="button" className="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div className="toast-body">
                {this.props.body}
                </div>
            </div>

        )


    }
} export default CommentView;