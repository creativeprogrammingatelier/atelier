import * as React from "react";
import { Route, Switch, Redirect, RouteProps } from "react-router-dom";
import { Component } from "react";
import AuthHelper from "../../helpers/AuthHelper";

class PrivateRoute extends Route {
    render() {
        console.log(this.props)

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
}
export default PrivateRoute;