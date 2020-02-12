import * as React from 'react';
import {Route, Switch, Redirect, RouteProps} from 'react-router-dom';
import AuthHelper from '../../helpers/AuthHelper';

type PrivateRouteProps = RouteProps & {
	roles?: string[],
	component: React.ComponentClass<any, any> | Function
}
class PrivateRoute extends Route<PrivateRouteProps> {

	state: {roleAuthorised: boolean};
	constructor(props: PrivateRouteProps) {
		super(props);
		this.state = {
			roleAuthorised: false
		};
	}

	componentDidMount() {
		this.checkRole();
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
	};

	render() {
		const urlParameters : any = {
			location : this.props.location
		};

		if (this.props.roles == undefined && AuthHelper.loggedIn()) {
			return (
				<Route
					render={() =>

						<span>{React.createElement(this.props.component, urlParameters)} </span>

					}
				/>
			);
		}
		if (this.state.roleAuthorised && AuthHelper.loggedIn()) {
			return (
				<Route
					render={() =>
						<span>{React.createElement(this.props.component, urlParameters)} </span>

					}
				/>
			);
		} else {
			if (AuthHelper.loggedIn()) {
				return (
					<span></span>
				);
			} else {
				return <Redirect to={{pathname: '/login', state: {from: this.props.location}}}/>;
			}

		}

	}

}
export default PrivateRoute;