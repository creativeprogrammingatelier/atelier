import React, {useState, useEffect, Fragment} from 'react';
import {Redirect} from 'react-router-dom';

import {AuthHelper} from '../helpers/AuthHelper';

import {LoadingIcon} from './general/loading/LoadingIcon';
import {FeedbackError} from './feedback/FeedbackError';
import {FeedbackContent} from './feedback/Feedback';

export function Logout() {
    const [loggedOut, setLoggedOut] = useState(false);
    const [error, setError] = useState(false as FeedbackContent);

    useEffect(() => {
        AuthHelper.logout()
            .then(() => setLoggedOut(true))
            .catch((err: Error) => setError(`Failed to log out: ${err.message}`));
    }, []);

    if (loggedOut) {
        return <Redirect to={{pathname: '/login'}}/>;
    } else {
        return (
            <Fragment>
                <FeedbackError close={setError}>{error}</FeedbackError>
                <LoadingIcon />
            </Fragment>
        );
    }
}