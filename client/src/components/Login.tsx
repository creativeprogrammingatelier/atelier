import React, {Component} from 'react';
import AuthHelper from '../../helpers/AuthHelper';
import {withRouter, Redirect, Link} from 'react-router-dom';
import '../styles/login.scss';
import {User} from '../../../models/database/User';
import {Form, Button, Jumbotron} from "react-bootstrap";
import { Loading } from './general/loading/Loading';
import { getLoginProviders } from '../../helpers/APIHelper';
import { LoginProvider } from '../../../models/api/LoginProvider';
import {Logo} from "./frame/Logo";

interface LoginRedirectProperties {
	state: {
		from: string
	}
}
interface LoginProperties {
	onLogin: (email: string) => void,
	location?: LoginRedirectProperties
}
export function Login({onLogin, location}: LoginProperties) {
	if (AuthHelper.loggedIn() && location && location.state && location.state.from) {
		return <Redirect to={location.state.from}/>
	}

	return <Jumbotron className="cover">
		<Logo/>
		<div className="text-center buttonList">
			<p>Select a login method</p>
			<hr/>
			<Loading<LoginProvider[]>
				loader={getLoginProviders}
				component={providers => {
					if (providers.length > 1) {
						return providers.map(provider => <Button size="lg"><a href={provider.url}>{provider.name}</a></Button>);
					} else if (providers.length > 0) {
						window.location.href = providers[0].url;
						return <p>Redirecting to {providers[0].name}</p>;
					} else {
						return <p>There are no login providers configured. If you are the administrator of this installation, please configure a login provider in the configuration files.</p>;
					}
				}}
			/>
		</div>
	</Jumbotron>
}

class LoginLegacy extends Component {
	state: {email: string, password: string, user: User | null, response: string, redirectToReferrer: boolean};
	props: any;
	constructor(props: any) {
		super(props);
		this.state = {
			email: '',
			password: '',
			user: null,
			response: '',
			redirectToReferrer: false
		};
	}


	handleInputChange = (event: {target: {value: any; name: any;};}) => {
		const {value, name} = event.target;
		this.setState({
			[name]: value
		});
	};

	onSubmit = (event: {preventDefault: () => void;}) => {
		event.preventDefault();
		AuthHelper.login(this.state.email, this.state.password, () => {
				this.props.onLogin(this.state.email);
				this.setState({
					redirectToReferrer: true
				});
			}, () => alert('Login Failed, Please register if you have not already')
		);

	};

	render() {
		if (this.state.redirectToReferrer) {
			return (
				<Redirect to="/"/>
			);
		}
		// return (
		// 	<div className="center-form-container">
		// 		<h3 style={{paddingBottom: 10}}>Welcome to Atelier</h3>
		// 		<div className="form-container">
		// 			<Form onSubmit={this.onSubmit}>
		// 				<div className="form-group">
		// 					<input
		// 						className="form-control"
		// 						type="email"
		// 						name="email"
		// 						placeholder="Email"
		// 						value={this.state.email}
		// 						onChange={this.handleInputChange}
		// 						required
		// 					/>
		// 				</div>
		// 				<div className="form-group">
		// 					<input
		// 						className="form-control"
		// 						type="password"
		// 						name="password"
		// 						placeholder="Password"
		// 						value={this.state.password}
		// 						onChange={this.handleInputChange}
		// 						required
		// 					/>
		// 				</div>
		// 				<p>{this.state.response}</p>
		// 				<div className="form-submit">
		// 					<ul>
		// 						<li>
		// 							<input className="btn btn-primary" type="submit" value="Login"/>
		// 						</li>
		// 						<li>
		// 							<React.Fragment>
		// 								<li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
		// 							</React.Fragment>
		// 						</li>
		// 					</ul>
		// 				</div>
		// 			</Form>
		// 		</div>
		// 	</div>
        // );
        return (
            <Loading<LoginProvider[]>
                loader={getLoginProviders}
                component={providers => {
                    if (providers.length > 1) {
                        return providers.map(provider => 
                            <a href={provider.url}>{provider.name}</a>
                        );
                    } else if (providers.length > 0) {
                        window.location.href = providers[0].url; 
                        return (
                           <p>Redirecting to {providers[0].name}</p>
                        );
                    } else {
                        return (
                            <p>There are no login providers configured. If you are the administrator of this installation, please configure a login provider in the configuration files.</p>
                        );
                    }
                }} />
        );
	}

}