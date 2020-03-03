/** Contains functions to access all API endpoints */

import { Fetch } from './FetchHelper';
import { ExtendedThread } from '../../models/database/Thread';
import { Course } from '../../models/database/Course';
import { Submission } from '../../models/database/Submission';
import { User } from '../../models/api/User';
import { Comment } from '../../models/database/Comment';
import { LoginProvider } from '../../models/api/LoginProvider';

// TODO: Fix all anys to be the correct model

// Courses
export const getCourses = () => 
    Fetch.fetchJson<Course[]>('/api/course/');

export const getCourse = (courseID: string) => 
    Fetch.fetchJson<Course>(`/api/course/${courseID}`);
    
export const createCourse = (course: Course) => 
    Fetch.fetchJson<Course>('/api/course', {
        method: 'POST',
        body: JSON.stringify(course),
        headers: { "Content-Type": "application/json" }
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

export const createSubmission = (courseId: string, projectName: string, files: File[]) => {
    const form = new FormData();
    form.append('project', projectName);
    for (const file of files) {
        form.append('files', file);
    }

    return Fetch.fetchJson<Submission>(`/api/submission/course/${courseId}`, {
        method: 'POST',
        body: form
        // Don't set the Content-Type header, it is automatically done by using FormData
        // and it breaks if you set it manually, as the boundaries will not be added
    });
}

// Files
export const getFiles = (submissionID: string) => 
    Fetch.fetchJson<File[]>(`/api/file/submission/${submissionID}`);

export const getFile = (fileId: string) => 
    Fetch.fetchJson<File>(`/api/file/${fileId}`);

export const getFileContents = (fileId : string) => 
    Fetch.fetchString(`/api/file/${fileId}/body`);
    
// CommentThreads
export const getFileComments = (fileID: string) => 
    Fetch.fetchJson<ExtendedThread[]>(`/api/commentThread/file/${fileID}`);

export const getProjectComments = (submissionID: string) => 
    Fetch.fetchJson<ExtendedThread[]>(`/api/commentThread/submission/${submissionID}`);
    
export const getRecentComments = (submissionID: string) => 
    Fetch.fetchJson<ExtendedThread[]>(`/api/commentThread/submission/${submissionID}/recent`);

export const createFileCommentThread = (fileID: string, thread: any) => 
    Fetch.fetchJson<ExtendedThread>(`/api/commentThread/file/${fileID}`, {
        method: 'POST',
        body: JSON.stringify(thread),
        headers: { "Content-Type": "application/json" }
    });

export const createComment = (commentThreadID: string, comment: Comment) =>
    Fetch.fetchJson<Comment>(`/api/comment/${commentThreadID}`, {
        method: 'PUT',
        body: JSON.stringify(comment),
        headers: { "Content-Type": "application/json" }
    });

// Search
export const search = (term: string) =>
    Fetch.fetchJson<any>(`/api/search?q=${term}`);

// Auth
export const getLoginProviders = () =>
    Fetch.fetchJson<LoginProvider[]>('/api/auth/providers');