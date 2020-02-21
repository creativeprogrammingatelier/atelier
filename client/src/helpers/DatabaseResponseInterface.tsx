import React from "react";

export interface UserResponse {
	userId: string,
	name: string
}

export interface EssentialSubmissionResponse {
	name: string,
	user: string,
	time: string,
	tags?: []
}

export interface SubmissionResponse {
	name: string,
	submissionId: string,
	user: string,
	userId: string,
	date: string,
	state: string,
	comments: CommentResponse[]
}

export interface CommentThreadResponse {
	commentThreadId: string,
	fileId: string,
	name: string,
	comments: CommentResponse[]
}

export interface CommentResponse {
	commentId: string,
	commentThreadId: string,
	submissionId: string,
	submissionName: string,
	fileId: string,
	fileName: string,
	userId: string,
	author: string,
	startLine: number,
	startCharacter: number,
	endLine: number,
	endCharacter: number
	text: string
}

export interface CourseResponse {
	courseId: string,
	name: string
}

export interface UserResponse {
	userId: string,
	name: string
}

export interface FileResponse {
	fileId: string,
	submissionId: string,
	userId: string,
	userName: string,
	snippet: string
}

export interface SearchResponse {
	submissions: SubmissionResponse[],
	files: FileResponse[],
	comments: CommentResponse[]
}

export interface CommentEssential {
	commentName: string,
	lastMessage: {
		text: string,
		author: string,
		time: string
	}
	snippet: string
}