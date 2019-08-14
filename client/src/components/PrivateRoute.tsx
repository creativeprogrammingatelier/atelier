import * as React from "react";
import { Route, Switch, Redirect, RouteProps } from "react-router-dom";
import { Component } from "react";
import AuthHelper from "../../helpers/AuthHelper";
type PrivateRouteProps = RouteProps & {
    role?: string
}
class PrivateRoute extends Route<PrivateRouteProps> {

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
        } else {
            return (
                <Route
                    render={
                        props => {
                            return (AuthHelper.getToken() && !AuthHelper.isTokenExpired(AuthHelper.getToken()) && AuthHelper.checkRole(this.props.role)
                                ? <span>{React.createElement(this.props.component)} </span>
                                : <Redirect to={{ pathname: '/login', state: { from: this.props.location } }} />);
                        }
                    }
                />
            )
        }

    }
}
export default PrivateRoute;