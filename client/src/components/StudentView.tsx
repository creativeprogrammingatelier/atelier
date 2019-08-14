import * as React from "react";
import { Route, Switch } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "./Home";
import Login from "./Login";

class StudentView extends React.Component {

    render() {
        return (
            < div >
                <h1>Hello Student</h1>
            </div>
        )
    }
} export default StudentView;