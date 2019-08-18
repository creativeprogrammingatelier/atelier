import * as React from "react";
import { Route, Switch } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "./Home";
import Login from "./Login";

class TAView extends React.Component {

    render() {
        return (
            < div >
                <h3>Hello Teaching Assistant</h3>
            </div>
        )
    }
} export default TAView;