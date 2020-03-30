import {ParentalProperties} from "./ParentHelper";

export interface HTMLProperties extends ParentalProperties {
	className?: string,
	id?: string,
	key?: string
	// Add more things as needed
}