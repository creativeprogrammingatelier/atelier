import React, {useEffect, useState, Fragment} from "react";

import {ParentalProperties} from "../../helpers/ParentHelper";
import {Breakpoint, breakpointValues} from "../../helpers/BootstrapHelper";

interface ResponsiveProperties extends ParentalProperties {
    breakpoints: Breakpoint[]
}
/**
 * Responsive component that resized based on the breakpoints being passed to it.
 */
export function Responsive({breakpoints, children}: ResponsiveProperties) {
    const [width, setWidth] = useState(windowWidth());
    const [breakpoint, setBreakpoint] = useState(currentBreakpoint(width));

    const handleWindowResize = () => {
        setWidth(windowWidth());
    };

    useEffect(() => {
        window.addEventListener("resize", handleWindowResize);
    }, []);
    useEffect(() => {
        setBreakpoint(currentBreakpoint(width));
    }, [width]);

    return <Fragment>{breakpoints.includes(breakpoint) && children}</Fragment>;
}

/**
 * Function for getting the width of the current window.
 */
function windowWidth() {
    return window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;
}

/**
 * Creates breakpoints for the responsive element based on the width of the screen.
 *
 * @param width Width of the window.
 */
function currentBreakpoint(width: number): Breakpoint {
    for (const [breakpoint, value] of Object.entries(breakpointValues).reverse()) {
        if (width >= value) {
            return breakpoint as Breakpoint;
        }
    }
    return Object.keys(breakpointValues)[0] as Breakpoint;
}
