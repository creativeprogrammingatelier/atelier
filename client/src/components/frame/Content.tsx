import React, {MouseEventHandler} from "react";
import {ParentalProperties} from "../../helpers/ParentHelper";
import {ErrorBoundary} from "../general/ErrorBoundary";

interface ContentProperties extends ParentalProperties {
	/** Callback function for when contents is clicked */
	onClick?: MouseEventHandler
}
/**
 * Component used to populate the ErrorBoundary component, with the function callback 
 * passed in to the div and children passed in.
 */
export function Content({children, onClick}: ContentProperties) {
    return <ErrorBoundary>
        <div className="content row no-gutters">
            <div className="contentMargin col-0 col-lg-3 col-xl-2"/>
            <div className="contentPage col-12 col-sm-12 col-md-12 col-lg-9 col-xl-10" onClick={onClick}>
                {children}
            </div>
        </div>
    </ErrorBoundary>;
}