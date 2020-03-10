export enum localRole {
	moduleCoordinator = "moduleCoordinator",
	teacher = "teacher",
	TA = "TA",
	assistant = "assistant",
	student = "student",
	plugin = "plugin",
	none = "none",
	DEBUG = "DEBUG"
}
export const localPermissionSize = 40

export function checkEnum(str : string) : str is keyof typeof localRole {
	return str in localRole
}