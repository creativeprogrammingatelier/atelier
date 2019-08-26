import * as React from "react";
import { Route, Switch, Link } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "./Home";
import Login from "./Login";
import TAView from "./TAView";
import StudentView from "./StudentView";
import Nav from "./Nav";
import Logout from "./Logout";
import "../styles/app.scss"
class App extends React.Component {

    render() {
        return (
            <div className="wrapper">
                <div className="container">
                    <Nav />
                    < Switch >
                        <PrivateRoute exact path='/' component={Home} />
                        <PrivateRoute exact path='/ta' component={TAView} role="ta" />
                        <PrivateRoute exact path='/student' component={StudentView} role="student" />
                        <Route path='/login' component={Login} />
                        <PrivateRoute path='/logout' component={Logout} />
                    </Switch >
                </div>
            </div>

        )
    }
} export default App;