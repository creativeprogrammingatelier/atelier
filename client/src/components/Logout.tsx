import * as React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "./Home";
import Login from "./Login";
import AuthHelper from "../../helpers/AuthHelper";

class Logout extends React.Component {
    state: { loggedOut: boolean }
    constructor(props: any) {
        super(props);
        this.state = {
            loggedOut: false
        }

    }
    componentDidMount() {
        AuthHelper.logout()
        this.setState({
            loggedOut: true
        });
    }

    render() {
        if (this.state.loggedOut == true) {
            return (
                < div >
                    <Redirect to={{ pathname: '/login' }} />
                </div>
            )
        }
        return (
            <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
            </div>

        )

    }
} export default Logout;