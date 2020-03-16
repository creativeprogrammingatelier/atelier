import { EnumError } from "./enumHelper"

export enum courseRole {
	moduleCoordinator = "moduleCoordinator",
	teacher = "teacher",
	TA = "TA",
	student = "student",
	plugin = 'plugin',
	none = 'none',
	unauthorized = 'unauthorized'
}
