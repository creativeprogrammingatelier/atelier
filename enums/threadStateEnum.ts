export enum threadState{
	public = 'public',
	private = 'private'
}
export function checkEnum(str: string) : str is keyof typeof threadState {
	return str in threadState
}