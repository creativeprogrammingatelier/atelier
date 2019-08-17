import * as React from "react";
import { Route, Switch, Link } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

class Nav extends React.Component {

    render() {
        return (
            < div >
                <ul className="nav">
                    <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/student">Student</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/ta">Teaching Assisant</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/logout">Logout</Link></li>
                </ul>
            </div>
        )
    }
} export default Nav;