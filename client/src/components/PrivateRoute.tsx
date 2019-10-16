import * as React from "react";
import { Route, Switch, Redirect, RouteProps } from "react-router-dom";
import { Component } from "react";
import AuthHelper from "../../helpers/AuthHelper";
type PrivateRouteProps = RouteProps & {
    roles?: any
}
class PrivateRoute extends Route<PrivateRouteProps> {

    state: { roleAuthorised: boolean };
    constructor(props: PrivateRouteProps) {
        super(props);
        this.state = {
            roleAuthorised: false
        }
    }

    componentDidMount() {
        this.checkRole()  
    }

    componentDidUpdate(prevProps: PrivateRouteProps) {
        if (this.props.roles !== prevProps.roles) {
            this.checkRole();
        }
    }

    checkRole = () => {
        if (this.props.roles != undefined) {
            this.setState({
                roleAuthorised: false
            });
            this.props.roles.forEach((role: string) => {
                AuthHelper.checkRole(role).then((response: any) => {
                    if (response.status == 204) {
                        this.setState({
                            roleAuthorised: true
                        });

                    }
                });

            });
        }
    }

    render() {
        if (this.props.roles == undefined && AuthHelper.loggedIn()) {
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
                return(
                    <span></span>
                                    //     // <h3>You have incorrect permission to view this page</h3>
                )
            } else {
                return <Redirect to={{ pathname: '/login', state: { from: this.props.location } }} />;
            }

        }

    }

}
export default PrivateRoute;