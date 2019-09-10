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
import AuthHelper from "../../helpers/AuthHelper"
import "../styles/app.scss"


class App extends React.Component {

    state: { loggedIn: boolean, email: string, role: string };
    props: any;
    constructor(props: any) {
        super(props);
        this.state = {
            loggedIn: false,
            email: '',
            role: 'none'
        }
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.checkAndSetRole = this.checkAndSetRole.bind(this);
    }

    handleLogin(role: string, email: string) {
        this.setState({
            loggedIn: true,
            email: email,
        })

        // Horrible stuff that should be refactored
        this.checkAndSetRole('ta');
        this.checkAndSetRole('student');
    }

    handleLogout() {
        this.setState({
            loggedIn: false,
            email: '',
            role: null
        })
    }

    checkAndSetRole(role: string) {
        AuthHelper.checkRole(role).then((response: any) => {
            if (response.status == 204) {
                this.setState({
                    role: role
                });
            }
        });
    }

    render() {
        return (
            <div className="wrapper">
                <div className="container">
                    
                    <div> Just for debugging, remove! : {this.state.role}</div>
                    <Nav loggedIn={this.state.loggedIn} role={this.state.role} onLogout={this.handleLogout} />
                    < Switch >
                        <Route path='/register' component={Register} />
                        <Route path='/login' render={(props) => <Login {...props} onLogin={this.handleLogin} />} />
                        <PrivateRoute exact path='/' component={Home} />
                        <PrivateRoute exact path='/ta' component={TAView} role="ta" />
                        <PrivateRoute exact path='/student' component={StudentView} role="student" />
                        <PrivateRoute path='/logout' component={Logout} />
                    </Switch >
                </div>
            </div>

        )
    }
} export default App;