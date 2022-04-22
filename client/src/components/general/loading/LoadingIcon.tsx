import React from "react";
import {Spinner} from "react-bootstrap";

/**
 * LoadingIcon used by the Loading component.
 */
export function LoadingIcon() {
    return <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
    </Spinner>;
}
