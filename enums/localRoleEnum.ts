export enum localRole {
	moduleCoordinator = "moduleCoordinator",
	teacher = "teacher",
	TA = "TA",
	assistant = "assistant",
	student = "student",
	none = "none"
}
export function checkEnum(str : string) : str is keyof typeof localRole {
	return str in localRole
}