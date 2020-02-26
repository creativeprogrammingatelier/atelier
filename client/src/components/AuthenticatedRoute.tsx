import React, {useEffect, useState} from 'react';
import {Redirect, Route} from 'react-router-dom';
import {RouteComponentProps} from 'react-router';

import AuthHelper from '../../helpers/AuthHelper';

interface AuthenticatedRouteProperties<T> {
	path: string,
	component: React.ComponentType<RouteComponentProps<T>> | React.ComponentType<T>,
	roles?: string[]
}
export function AuthenticatedRoute<T>({path, component, roles}: AuthenticatedRouteProperties<T>) {
	const [authenticated, setAuthenticated] = useState(undefined as boolean | undefined);

	useEffect(() => {
		if (roles !== undefined) {
			AuthHelper.checkRoles(roles).then((response: {status: number}) => {
				setAuthenticated(response.status === 204);
			});
		} else {
			setAuthenticated(true);
		}
	}, []);

	if (authenticated !== undefined) {
		if ((authenticated || roles === undefined) && AuthHelper.loggedIn()) {
			return <Route path={path} component={component}/>
		}
		if (AuthHelper.loggedIn()) {
			return <Redirect to="/"/>
		}
		return <Redirect to={{pathname: '/login', state: {from: path}}}/>
	}
	return <p>Waiting</p> // TODO: Make more user friendly
}

