import React, { Component } from "react";
import {
    Route,
    NavLink,
    HashRouter
} from "react-router-dom";
import firebase from 'firebase';
import Home from "./Home";
import StudentView from "./StudentView";
import TAView from "./TAView";

class Main extends Component {
    render() {
        return (<HashRouter >
            <div>
                <ul className="header" >
                    <li> <NavLink to="/" > Home </NavLink></li>
                    <li> <NavLink to="/student" > Student View </NavLink> </li>
                    <li> <NavLink to="/TA" > TA View </NavLink> </li>
                </ul>
                <div className="content">
                    <
                        Route exact path="/"
                        component={Home}
                    />
                    <
                        Route path="/student"
                        component={StudentView}
                    />
                    <
                        Route path="/TA"
                        component={TAView}
                    />
                </div>
            </ div>
        </ HashRouter >
        );
    }
}

export default Main;