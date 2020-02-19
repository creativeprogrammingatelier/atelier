export enum submissionStatus {
	new= 'new',
	closed= 'closed',
	unread= 'unread'
}
export function checkEnum(str : string) : str is keyof typeof submissionStatus {
	return str in submissionStatus
}