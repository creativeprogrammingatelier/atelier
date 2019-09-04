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
            <div>
                <p >{this.props.body}</p>
                <p>Written by: {this.props.author.email}</p>
            </div >

        )


    }
} export default CommentView;