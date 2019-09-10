import * as React from "react";
import { Route, Switch, Link } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "./Home";
import Login from "./Login";
import TAView from "./TAView";
import StudentView from "./StudentView";
import Nav from "./Nav";
import Logout from "./Logout";
import Register from "./Register"
import "../styles/app.scss"


class App extends React.Component {

    state: { loggedIn: boolean, email: string, role: string };
    props: any;
    constructor(props: any) {
        super(props);
        this.state = {
            loggedIn: false,
            email: '',
            role: null
        }
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    handleLogin(role: string, email: string) {
        this.setState({
            loggedIn: true,
            email: email,
            role: role
        })
    }

    handleLogout() {
        this.setState({
            loggedIn: false,
            email: '',
            role: null
        })
    }

    render() {
        return (
            <div className="wrapper">
                <div className="container">
                    <div>{this.state.loggedIn}</div>
                    <Nav />
                    < Switch >
                        <PrivateRoute exact path='/' component={Home} />
                        <PrivateRoute exact path='/ta' component={TAView} role="ta" />
                        <PrivateRoute exact path='/student' component={StudentView} role="student" />
                        <Route path='/register' component={Register} />
                        <Route path='/login' render={(props) => <Login {...props} onLogin={this.handleLogin} />} />
                        <PrivateRoute path='/logout' render={(props) => <Logout {...props} onLogout={this.handleLogout} />} />
                    </Switch >
                </div>
            </div>

        )
    }
} export default App;