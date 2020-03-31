export type BootstrapVariant =
	| "primary"
	| "secondary"
	| "success"
	| "danger"
	| "warning"
	| "info"
	| "light"
	| "dark";

export const breakpointValues = {
	// Same breakpoints as Bootstrap, maybe find a way to merge declarations
	extraSmall: 0,
	small: 576,
	medium: 768,
	large: 992,
	extraLarge: 1200
};