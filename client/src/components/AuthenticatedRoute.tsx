import React from 'react';
import {Route} from 'react-router-dom';
import {RouteComponentProps} from 'react-router';

import {AuthHelper} from '../helpers/AuthHelper';
import {Login} from './Login';
import {ResearchPermissionWrapper} from './ResearchPermissionWrapper';

interface LocationProperties {
	/** String representation of the location */
	pathname: string
}
interface AuthenticatedRouteProperties<T> {
	/** Route Path*/
	path: string,
	/** Route Component */
	component: React.ComponentType<RouteComponentProps<T>> | React.ComponentType<T>,
	/** Root relative URL*/
	location?: LocationProperties
}
/**
 * Component used for authenticating route calls. If the user is not logged in the
 * authenticator will send them to the Log-In page, if they are the route call
 * goes through.
 */
export function AuthenticatedRoute<T>({path, component, location}: AuthenticatedRouteProperties<T>) {
  if (AuthHelper.loggedIn()) {
    return <ResearchPermissionWrapper>
      <Route path={path} component={component}/>
    </ResearchPermissionWrapper>;
  } else {
    console.log('route' + (location ? location.pathname : path));
    return <Route render={(props) => <Login {...props} location={{state: {from: location ? location.pathname : path}}} />}/>;
    // return <Redirect to={{pathname: "/login", state: {from: location ? location.pathname : path}}}/>;
  }
}
