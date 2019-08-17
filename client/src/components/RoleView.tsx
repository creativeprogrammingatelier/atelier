import * as React from "react";
import { Route, Switch } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "./Home";
import Login from "./Login";
import AuthHelper from "../../helpers/AuthHelper";
import StudentView from "./StudentView";
import TAView from "./TAView";

class RoleView extends React.Component {

    constructor(props: any) {
        super(props)
    }


    render() {
        return (
            <StudentView />
        )


    }
} export default RoleView;