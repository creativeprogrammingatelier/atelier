import React from "react";
import {Redirect} from "react-router-dom";
import {Button, Jumbotron} from "react-bootstrap";

import {LoginProvider} from "../../../models/api/LoginProvider";

import {getLoginProviders} from "../helpers/api/APIHelper";
import {AuthHelper} from "../helpers/AuthHelper";

import {Logo} from "./frame/Logo";
import {Loading} from "./general/loading/Loading";

import "../styles/login.scss";

interface LoginRedirectProperties {
	state: {
		from: string
	}
}
interface LoginProperties {
	location?: LoginRedirectProperties
}
export function Login({location}: LoginProperties) {
	if (AuthHelper.loggedIn() && location && location.state && location.state.from) {
		return <Redirect to={location.state.from}/>;
	}

	if (location && location.state && location.state.from) {
		console.log("Login: " + location.state.from);
		localStorage.setItem('redirect', location.state.from);
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
						return providers.map(provider => <a key={provider.url} href={provider.url}><Button
							size="lg">{provider.name}</Button></a>);
					} else if (providers.length > 0) {
						window.location.href = providers[0].url;
						return <p>Redirecting to {providers[0].name}</p>;
					} else {
						return <p>There are no login providers configured. If you are the administrator of this
							installation, please configure a login provider in the configuration files.</p>;
					}
				}}
			/>
		</div>
	</Jumbotron>;
}