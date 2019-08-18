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
        if (this.props.role !== prevProps.role && this.props.role != undefined) {
            this.checkRole()
        }
    }

    checkRole() {
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

    render() {
        if (this.props.role == undefined && AuthHelper.loggedIn()) {
            return (
                <Route
                    render={() =>

                        <span>{React.createElement(this.props.component)} </span>

                    }
                />
            )
        } if (this.state.roleAuthorised && AuthHelper.loggedIn()) {
            return (
                <Route
                    render={() =>
                        <span>{React.createElement(this.props.component)} </span>

                    }
                />
            )
        }
        else {
            if (AuthHelper.loggedIn()) {
                return (
                    <h3>You have incorrect permission to view this page</h3>
                )
            } else {
                return <Redirect to={{ pathname: '/login', state: { from: this.props.location } }} />;
            }

        }

    }

}
export default PrivateRoute;