import React, {useEffect, useState, Fragment} from 'react';

import {ParentalProperties} from '../../helpers/ParentHelper';
import {Breakpoint, breakpointValues} from '../../helpers/BootstrapHelper';

interface ResponsiveProperties extends ParentalProperties {
	breakpoints: Breakpoint[]
}
/**
 * Responsive component that resized based on the breakpoints being passed to it.
 */
export function Responsive({breakpoints, children}: ResponsiveProperties) {
  const [width, setWidth] = useState(windowWidth());
  const [height, setHeight] = useState(windowHeight());
  const [breakpoint, setBreakpoint] = useState(currentBreakpoint(width) as Breakpoint);

  const handleWindowResize = () => {
    setWidth(windowWidth());
    setHeight(windowHeight());
  };

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
  }, []);
  useEffect(() => {
    setBreakpoint(currentBreakpoint(width));
  }, [width]);

  return <Fragment>{breakpoints.includes(breakpoint) && children}</Fragment>;
}

/**
 * Function for getting the window size. Window size is a tuple of
 * the width and height of the window.
 */
function windowSize() {
  return {windowWidth, windowHeight};
}
/**
 * Function for getting the width of the current window.
 */
function windowWidth() {
  return window.innerWidth ||
		document.documentElement.clientWidth ||
		document.body.clientWidth;
}
/**
 * Function for getting height of the window.
 */
function windowHeight() {
  return window.innerHeight ||
		document.documentElement.clientHeight ||
		document.body.clientHeight;
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
