import * as React from "react";
import { Route, Switch, Link } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "./Home";
import Login from "./Login";
import TAView from "./TAView";
import StudentView from "./StudentView";

class App extends React.Component {

    render() {
        return (
            < div >
                < Switch >
                    <PrivateRoute exact path='/' component={Home} />
                    <PrivateRoute exact path='/ta' component={TAView} role={"TA"} />
                    <PrivateRoute exact path='/student' component={StudentView} role={"Student"} />
                    <Route path='/login' component={Login} />
                </Switch >

                <ul>
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/student">Student</Link></li>
                    <li><Link to="/ta">Teaching Assisant</Link></li>
                </ul>
            </div>
        )
    }
} export default App;