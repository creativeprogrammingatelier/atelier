import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import {RouteComponentProps} from 'react-router';

import AuthHelper from '../../helpers/AuthHelper';

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
        return <Route path={path} component={component}/>;
    } else {
        return <Redirect to={{pathname: '/login', state: {from: location ? location.pathname : path}}}/>
    }
}
