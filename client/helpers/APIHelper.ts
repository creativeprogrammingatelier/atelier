/** Contains functions to access all API endpoints */

import { Fetch } from './FetchHelper';
import { CommentThread } from '../../models/api/CommentThread';
import { Course } from '../../models/api/Course';
import { Submission } from '../../models/api/Submission';
import { User } from '../../models/api/User';
import { Comment } from "../../models/api/Comment";
import { File } from "../../models/api/File";

// TODO: Fix all anys to be the correct model

// Courses
export const getCourses = () => 
    Fetch.fetchJson<Course[]>('/api/course/');

export const getCourse = (courseID: string) => 
    Fetch.fetchJson<Course>(`/api/course/${courseID}`);
    
export const createCourse = (course: {name : string, state : string}) =>
    Fetch.fetchJson<Course>('/api/course', {
        method : 'POST',
        body : JSON.stringify(course)
    });

// Users
export const getCurrentUser = () => 
    Fetch.fetchJson<User>('/api/user/');

export const getUser = (userId: string) => 
    Fetch.fetchJson<User>(`/api/user/${userId}`);

// Submissions
export const getCourseSubmissions = (courseId: string) => 
    Fetch.fetchJson<Submission[]>(`/api/submission/course/${courseId}`);
    
export const getUserSubmissions = (userId: string) => 
    Fetch.fetchJson<Submission[]>(`/api/submission/user/${userId}`);

export const getSubmission = (submissionID: string) => 
    Fetch.fetchJson<Submission>(`/api/submission/${submissionID}`);

// Files
export const getFiles = (submissionID: string) => 
    Fetch.fetchJson<File[]>(`/api/file/submission/${submissionID}`);

export const getFile = (fileId: string) => 
    Fetch.fetchJson<File>(`/api/file/${fileId}`);

export const getFileContents = (fileId : string) => 
    Fetch.fetchString(`/api/file/${fileId}/body`);
    
// CommentThreads
export const getFileComments = (fileID: string) => 
    Fetch.fetchJson<CommentThread[]>(`/api/commentThread/file/${fileID}`);

export const getProjectComments = (submissionID: string) => 
    Fetch.fetchJson<CommentThread[]>(`/api/commentThread/submission/${submissionID}`);
    
export const getRecentComments = (submissionID: string) => 
    Fetch.fetchJson<CommentThread[]>(`/api/commentThread/submission/${submissionID}/recent`);

export const createFileCommentThread = (fileID: string, thread: any) => 
    Fetch.fetchJson<CommentThread>(`/api/commentThread/file/${fileID}`, {
        method : 'POST',
        body : JSON.stringify(thread)
    });

export const createComment = (commentThreadID: string, comment : {commentBody : string}) =>
    Fetch.fetchJson<Comment>(`/api/comment/${commentThreadID}`, {
        method : 'PUT',
        body : JSON.stringify(comment)
    });

// Search
export const search = (term: string) =>
    Fetch.fetchJson<any>(`/api/search?q=${term}`);
