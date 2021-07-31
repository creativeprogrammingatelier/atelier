export type BootstrapVariant =
	| "primary"
	| "secondary"
	| "success"
	| "danger"
	| "warning"
	| "info"
	| "light"
	| "dark";
export type Breakpoint =
	| "extraSmall"
	| "small"
	| "medium"
	| "large"
	| "extraLarge"

export const breakpointValues = {
    // Same breakpoints as Bootstrap, maybe find a way to merge declarations
    extraSmall: 0,
    small: 576,
    medium: 768,
    large: 992,
    extraLarge: 1200
};
export const columnValues = [
    // Same column values as bootstrap, but specified only by amount
    "0%",
    "calc(1/12 * 100%)",
    "calc(2/12 * 100%)",
    "25%",
    "calc(4/12 * 100%)",
    "calc(5/12 * 100%)",
    "50%",
    "calc(7/12 * 100%)",
    "calc(8/12 * 100%)",
    "75%",
    "calc(10/12 * 100%)",
    "calc(11/12 * 100%)",
    "100%"
];