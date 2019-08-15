import * as React from "react";
import { Route, Switch, Link } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

class Home extends React.Component {

    render() {
        return (
            < div >
                <h1>Welcome Home (Login required to arrive here)</h1>
                <ul>
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/student">Student</Link></li>
                    <li><Link to="/ta">Teaching Assisant</Link></li>
                </ul>
            </div>
        )
    }
} export default Home;