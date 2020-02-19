export enum courseState {
	hidden = "hidden",
	open = "open",
	finished = "finished"
}
export function checkEnum(str : string) : str is keyof typeof courseState {
	return str in courseState
}