import React, { Component } from "react";
import {
    Route,
    HashRouter,
    Switch,
    Link
} from "react-router-dom";
import StudentView from "./StudentView";
import TAView from "./TAView";
import Login from "./Login"
import Logout from "./Logout";
class Nav extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email: localStorage.getItem("email")
        }
    }
    componentWillMount = () => {

    }


    handleInputChange = (event) => {
        const { value, name } = event.target;
        this.setState({
            [name]: value
        })
    };


    render() {
        return (<HashRouter>
            <div className="in">
                <ul>
                    <li><Link to="/login">Login</Link></li>
                    <p>{this.state.email}</p>
                    <li><Link to="/">Student</Link></li>
                    <li><Link to="/secret">Teaching Assisant</Link></li>
                    <li><Logout></Logout></li>
                </ul>
                <Switch>
                    <Route path="/" exact component={StudentView} />
                    <Route path="/login" exact component={Login} />
                    <Route path="/secret" component={TAView} />
                </Switch>
            </ div>
        </ HashRouter >
        );
    }
}
export default Nav;