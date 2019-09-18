import * as React from "react";
import { Route, Switch, Link, Redirect } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Login from "./Login";
import TAView from "./TAView";
import StudentView from "./StudentView";
import RoleView from "./RoleView";
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
            email: localStorage.getItem('email') || '',
            role: 'none'
        }
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    componentDidMount() {
        this.checkTAorStudent();
    }

    handleLogin(email: string) {
        this.setState({
            loggedIn: true,
            email: email,
        })
        localStorage.setItem('email', email)
        this.checkTAorStudent();
    }

    handleLogout() {
        this.setState({
            loggedIn: false,
            email: '',
            role: null
        })
    }

    // Horrible stuff that should be refactored
    checkTAorStudent() {
        this.checkAndSetRole('ta');
        this.checkAndSetRole('student');
    }

    checkAndSetRole(role: string) {
        AuthHelper.checkRole(role).then((response: any) => {
            if (response.status == 204) {
                this.setState({
                    role: role,
                    loggedIn: true
                });
            }
        });
    }

    render() {
        return (
            <div className="wrapper">
                <div className="container">
                    <Nav loggedIn={this.state.loggedIn} role={this.state.role} email={this.state.email} onLogout={this.handleLogout} />
                    < Switch >
                        <Redirect exact from="/" to="/roleview" />
                        {/* <Route path='/register' component={Register} /> */}
                        <Route path='/login' render={(props) => <Login {...props} onLogin={this.handleLogin} />} />
                        <PrivateRoute exact path='/ta' component={TAView} roles={["ta"]} />
                        <PrivateRoute exact path='/student' component={StudentView} roles={["student"]} />
                        <PrivateRoute exact path='/roleview' component={(props: any) => <RoleView {...props} role={this.state.role} />} roles={["ta", "student"]} />
                        <PrivateRoute path='/logout' component={Logout} />
                    </Switch >
                </div>
            </div>

        )
    }
} export default App;