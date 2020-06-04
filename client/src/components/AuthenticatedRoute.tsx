import React from "react";
import {Redirect, Route} from "react-router-dom";
import {RouteComponentProps} from "react-router";

import {AuthHelper} from "../helpers/AuthHelper";
import {Login} from "./Login";
import { ResearchPermissionWrapper } from "./ResearchPermissionWrapper";

interface LocationProperties {
	pathname: string
}
interface AuthenticatedRouteProperties<T> {
	path: string,
	component: React.ComponentType<RouteComponentProps<T>> | React.ComponentType<T>,
	location?: LocationProperties
}
export function AuthenticatedRoute<T>({path, component, location}: AuthenticatedRouteProperties<T>) {
	if (AuthHelper.loggedIn()) {
		return <ResearchPermissionWrapper>
            <Route path={path} component={component}/>;
        </ResearchPermissionWrapper>;
	} else {
		console.log("route" + (location ? location.pathname : path));
		return <Route render={props => <Login {...props} location={{state : {from : location ? location.pathname : path}}} />}/>
		//return <Redirect to={{pathname: "/login", state: {from: location ? location.pathname : path}}}/>;
	}
}
