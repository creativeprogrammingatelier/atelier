import React, {useEffect, useState, Fragment} from "react";
import {ParentalProperties} from "../../helpers/ParentHelper";

// TODO: Maybe split this file into some form of helper for all the sizes and breakpoint stuff
interface ResponsiveProperties extends ParentalProperties {
	breakpoints: string[]
}
const breakpointValues = {
	// Same breakpoints as Bootstrap, maybe find a way to merge declarations
	extraSmall: 0,
	small: 576,
	medium: 768,
	large: 992,
	extraLarge: 1200
};
export function Responsive({breakpoints, children}: ResponsiveProperties) {
	const [width, setWidth] = useState(windowWidth());
	const [height, setHeight] = useState(windowHeight());
	const [breakpoint, setBreakpoint] = useState(currentBreakpoint(width));

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
function currentBreakpoint(width: number) {
	for (const [breakpoint, value] of Object.entries(breakpointValues).reverse()) {
		if (width >= value) {
			return breakpoint;
		}
	}
	return Object.keys(breakpointValues)[0];
}