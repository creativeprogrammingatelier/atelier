import React, {Fragment} from "react";
import {Link} from "react-router-dom";
import {ParentalProperties} from "../../helpers/ParentHelper";

interface OptionalLinkProperties extends ParentalProperties {
    /** Destination for the link */
    to?: string
}
/** Defines a component who can either be a link or if the destination variable is
 * 	undefined will simply wrap the child in a Fragment.
 */
export function OptionalLink({to, children}: OptionalLinkProperties) {
    if (to !== undefined) {
        return <Link to={to}>{children}</Link>;
    } else {
        return <Fragment>{children}</Fragment>;
    }
}
