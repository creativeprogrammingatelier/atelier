export interface Mention {
	mentionID: string,
	userID: string,
	commentID: string,
	references:{
		commentThreadID : string,
		submissionID : string,
		courseID : string,
	}
}