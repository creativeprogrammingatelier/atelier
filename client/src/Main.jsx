import React, { Component } from "react";
import {
    Route,
    NavLink,
    HashRouter,
    Switch,
    Link
} from "react-router-dom";
import firebase from 'firebase';
import Home from "./Home";
import StudentView from "./StudentView";
import TAView from "./TAView";

class Main extends Component {
    render() {
        return (<HashRouter >
            <div>
                <ul>
                    <li><Link to="/">Student</Link></li>
                    <li><Link to="/secret">Teaching Assisant</Link></li>
                </ul>
                <Switch>
                    <Route path="/" exact component={StudentView} />
                    <Route path="/secret" component={TAView} />
                </Switch>
            </ div>
        </ HashRouter >
        );
    }
}

export default Main;