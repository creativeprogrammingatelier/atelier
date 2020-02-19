export enum threadState{
	public = 'public',
	closed = 'closed'
}
export function checkEnum(str: string) : str is keyof typeof threadState {
	return str in threadState
}