import React from 'react';

export interface UserResponse {
    userId : number,
    name : string
}

export interface EssentialSubmissionResponse {
    name : string,
    user : string,
    time : string,
    tags? : []
}

export interface SubmissionResponse {
    name : string,
    submissionId : number,
    user : string,
    userId : number,
    date : string,
    state : string,
    comments : CommentResponse[]
}

export interface CommentThreadResponse {
    commentThreadId : number,
    fileId : number,
    name : string,
    comments : CommentResponse[]
}

export interface CommentResponse {
    commentId : number,
    commentThreadId : number,
    submissionId : number,
    submissionName : string,
    fileId : number,
    fileName : string,
    userId : number,
    author : string,
    startLine : number,
    startCharacter : number,
    endLine : number,
    endCharacter : number
    text : string
}

export interface CourseResponse {
    courseId : number,
    name : string
}

export interface UserResponse {
    userId : number,
    name : string
}

export interface FileResponse {
    fileId : number,
    submissionId : number,
    userId : number,
    userName : string,
    snippet : string
}

export interface SearchResponse {
    submissions : SubmissionResponse[],
    files : FileResponse[],
    comments : CommentResponse[]
}