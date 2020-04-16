import React, {Fragment} from "react";
import {Link} from "react-router-dom";
import {ParentalProperties} from "../../helpers/ParentHelper";

interface OptionalLinkProperties extends ParentalProperties {
	to?: string
}
export function OptionalLink({to, children}: OptionalLinkProperties) {
	if (to !== undefined) {
		return <Link to={to}>{children}</Link>;
	} else {
		return <Fragment>{children}</Fragment>;
	}
}