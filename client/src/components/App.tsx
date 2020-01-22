import * as React from "react";
import { Route, Switch, Link, Redirect } from "react-router-dom";
import Sidebar from "react-sidebar";
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
import SidebarContent from "./sidebar/SidebarContent"
import "../styles/sidebar.scss"

/**
 *  
 */
const EMAILLOCALSTORAGEKEY = 'email';
type AppState = { loggedIn: boolean, email: string, role: roleEnum, sidebarOpen: boolean };

type AppProps = {};


class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = {
            loggedIn: false,
            email: localStorage.getItem(EMAILLOCALSTORAGEKEY) || '',
            role: roleEnum.None,
            sidebarOpen: false
        }
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.onSidebarToggle = this.onSidebarToggle.bind(this);
    }

    componentDidMount() {
        this.getAndSetRole();
    }

    onSidebarToggle(open) {
        this.setState(prevState => ({
            sidebarOpen: !prevState.sidebarOpen
        }));
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
            <div className="container">
                <Sidebar
                    sidebar={<SidebarContent />}
                    open={this.state.sidebarOpen}
                    onSetOpen={this.onSidebarToggle}
                    pullRight={true}
                    styles={{ sidebar: { background: "white" } }}
                >
                    <Nav loggedIn={this.state.loggedIn} role={this.state.role} email={this.state.email} onLogout={this.handleLogout} onSidebarToggle={this.onSidebarToggle} />

                    <div className="wrapper">
                        <div className="container-fluid">
                            < Switch >
                                <Redirect exact from="/" to="/roleview" />
                                <Route path='/register' render={(props) => <Register {...props} onLogin={this.handleLogin} />} />
                                <Route path='/login' render={(props) => <Login {...props} onLogin={this.handleLogin} />} />
                                <PrivateRoute exact path='/ta' component={TAView} roles={["teacher"]} />
                                <PrivateRoute exact path='/student' component={StudentView} roles={["student"]} />
                                <PrivateRoute exact path='/roleview' component={(props: any) => <RoleView {...props} role={this.state.role} />} roles={["teacher", "student"]} />
                                <PrivateRoute path='/logout' component={Logout} />
                            </Switch >
                        </div>
                    </div>
                </Sidebar>

            </div>

        )
    }
} export default App;