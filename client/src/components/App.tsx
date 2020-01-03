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
import roleEnum from "../../../enums/roleEnum"

/**
 *  
 */
const EMAILLOCALSTORAGEKEY = 'email';
type AppState = { loggedIn: boolean, email: string, role: roleEnum  };

type AppProps = {};


class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = {
            loggedIn: false,
            email: localStorage.getItem(EMAILLOCALSTORAGEKEY) || '',
            role: roleEnum.None
        }
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    componentDidMount() {
        this.getAndSetRole();
    }

    handleLogin(email: string) {
        this.setState({
            loggedIn: true,
            email: email,
        })
        localStorage.setItem(EMAILLOCALSTORAGEKEY, email)
        this.getAndSetRole();
    }

    handleLogout() {
        this.setState({
            loggedIn: false,
            email: '',
            role: roleEnum.None
        })
    }

    getAndSetRole() {
        AuthHelper.getRole().then((response: Response) => {
            response.json().then((json: any) => {
                let userRole = json.role;
                if (response.status == 200) {
                    this.setState({
                        role: userRole,
                        loggedIn: true
                    });
                }
            })
        });
    }

    render() {
        return (
            <div className="wrapper">
                <div className="container-fluid">
                    <Nav loggedIn={this.state.loggedIn} role={this.state.role} email={this.state.email} onLogout={this.handleLogout} />
                    < Switch >
                        <Redirect exact from="/" to="/roleview" />
                        <Route path='/register' render={(props) => <Register {...props} onLogin={this.handleLogin} />} />
                        <Route path='/login' render={(props) => <Login {...props} onLogin={this.handleLogin} />} />
                        <PrivateRoute exact path='/ta' component={TAView} roles={["teacher"]} />
                        <PrivateRoute exact path='/student' component={StudentView} roles={["student"]} />
                        <PrivateRoute exact path='/roleview' component={(props: any) => <RoleView {...props} role={this.state.role} />} roles={["teacher", "student", "admin"]} />
                        <PrivateRoute path='/logout' component={Logout} />
                    </Switch >
                </div>
            </div>

        )
    }
} export default App;