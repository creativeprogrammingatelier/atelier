export enum localRole {
	moduleCoordinator = "moduleCoordinator",
	teacher = "teacher",
	TA = "TA",
	assistant = "assistant",
	student = "student",
	none = "none",
	unauthorized = 'unauthorized',
	plugin = 'plugin'
}
export const localPermissionSize = 40

export function checkEnum(str : string) : str is keyof typeof localRole {
	return str in localRole
}