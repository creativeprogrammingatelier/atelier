import * as React from "react";
import { Route, Switch, Redirect, RouteProps } from "react-router-dom";
import { Component } from "react";
import AuthHelper from "../../helpers/AuthHelper";
import roleEnum from "../../../enums/roleEnum";
type PrivateRouteProps = RouteProps & {
    roles?: roleEnum[],
    component: React.ComponentClass<any, any>  | Function
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
            AuthHelper.checkRoles(this.props.roles).then((response: any) => {
                if (response.status == 204) {
                    this.setState({
                        roleAuthorised: true
                    });
                }
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
                )
            } else {
                return <Redirect to={{ pathname: '/login', state: { from: this.props.location } }} />;
            }

        }

    }

}
export default PrivateRoute;