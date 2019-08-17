import * as React from "react";
import { Route, Switch } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "./Home";
import Login from "./Login";
import AuthHelper from "../../helpers/AuthHelper";

class RoleView extends React.Component {

    render() {
        return (
            <p>Role View</p>
        )
    }
} export default RoleView;