import React, {useState, useEffect, Fragment} from "react";
import {Redirect} from "react-router-dom";

import {AuthHelper} from "../helpers/AuthHelper";

import {FeedbackContent} from "./feedback/Feedback";
import {FeedbackError} from "./feedback/FeedbackError";
import {useRawCache} from "./general/loading/CacheProvider";
import {LoadingIcon} from "./general/loading/LoadingIcon";

/**
 * Component that handles user logout.
 */
export function Logout() {
    const [loggedOut, setLoggedOut] = useState(false);
    const [error, setError] = useState(false as FeedbackContent);
    const cache = useRawCache();

    useEffect(() => {
        AuthHelper.logout()
            .then(() => {
                cache.clearAll();
                setLoggedOut(true);
            })
            .catch((err: Error) => setError(`Failed to log out: ${err.message}`));
    }, []);

    if (loggedOut) {
        return <Redirect to={{pathname: "/login"}}/>;
    } else {
        return (
            <Fragment>
                <FeedbackError close={setError}>{error}</FeedbackError>
                <LoadingIcon/>
            </Fragment>
        );
    }
}
