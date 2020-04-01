import React, {useEffect, useState, Fragment} from "react";

import {ParentalProperties} from "../../helpers/ParentHelper";
import {Breakpoint, breakpointValues} from "../../helpers/BootstrapHelper";

interface ResponsiveProperties extends ParentalProperties {
	breakpoints: Breakpoint[]
}
export function Responsive({breakpoints, children}: ResponsiveProperties) {
	const [width, setWidth] = useState(windowWidth());
	const [height, setHeight] = useState(windowHeight());
	const [breakpoint, setBreakpoint] = useState(currentBreakpoint(width) as Breakpoint);

	const handleWindowResize = () => {
		setWidth(windowWidth());
		setHeight(windowHeight());
	};

	useEffect(() => {window.addEventListener('resize', handleWindowResize);}, []);
	useEffect(() => {setBreakpoint(currentBreakpoint(width))}, [width]);

	return <Fragment>{breakpoints.includes(breakpoint) && children}</Fragment>;
}

function windowSize() {
	return {windowWidth, windowHeight}
}
function windowWidth() {
	return window.innerWidth
		|| document.documentElement.clientWidth
		|| document.body.clientWidth
}
function windowHeight() {
	return window.innerHeight
		|| document.documentElement.clientHeight
		|| document.body.clientHeight
}
function currentBreakpoint(width: number): Breakpoint {
	for (const [breakpoint, value] of Object.entries(breakpointValues).reverse()) {
		if (width >= value) {
			return breakpoint as Breakpoint;
		}
	}
	return Object.keys(breakpointValues)[0] as Breakpoint;
}