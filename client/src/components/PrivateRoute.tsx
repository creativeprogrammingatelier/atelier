import * as React from "react";
import { Route, Switch, Redirect, RouteProps } from "react-router-dom";
import { Component } from "react";
import AuthHelper from "../../helpers/AuthHelper";
type PrivateRouteProps = RouteProps & {
    role?: string
}
class PrivateRoute extends Route<PrivateRouteProps> {

    state: { roleAuthorised: boolean };
    constructor(props: PrivateRouteProps) {
        super(props);
        this.state = {
            roleAuthorised: false
        }
    }

    componentDidUpdate(prevProps: PrivateRouteProps) {
        if (this.props.role !== prevProps.role) {
            this.checkRole()
        }
    }

    checkRole() {
        if (this.props.role == undefined) {
            return;
        } else {
            AuthHelper.checkRole(this.props.role).then((response: any) => {
                if (response.status == 204) {
                    this.setState({
                        roleAuthorised: true
                    });
                } else {
                    this.setState({
                        roleAuthorised: false
                    });
                }
            }).catch((res: any) => {
                this.setState({
                    roleAuthorised: false
                });
            });
        }
    }

    render() {
        if (this.props.role == undefined) {
            return (
                <Route
                    render={
                        props => {
                            return (AuthHelper.getToken() && !AuthHelper.isTokenExpired(AuthHelper.getToken())
                                ? <span>{React.createElement(this.props.component)} </span>
                                : <Redirect to={{ pathname: '/login', state: { from: this.props.location } }} />);
                        }
                    }
                />
            )
        } if (this.state.roleAuthorised) {
            return (
                <Route
                    render={
                        props => {
                            return (AuthHelper.getToken() && !AuthHelper.isTokenExpired(AuthHelper.getToken())
                                ? <span>{React.createElement(this.props.component)} </span>
                                : <Redirect to={{ pathname: '/login', state: { from: this.props.location } }} />);
                        }
                    }
                />
            )
        }
        else {
            return (
                <h1>You have incorrect permission to view this page</h1>
            )
        }

    }

}
export default PrivateRoute;