import { Cache, CacheState, CacheCollection, CacheItem, CacheCollectionInterface, emptyCacheItem, CacheItemInterface } from './Cache';
import { Course } from '../../../../models/api/Course';
import * as API from '../../../helpers/APIHelper';
import { randomBytes } from 'crypto';
import { User } from '../../../../models/api/User';
import { Permission } from '../../../../models/api/Permission';
import { useCacheItem, useCacheCollection, useRawCache } from '../../components/general/loading/CacheProvider';
import { Submission } from '../../../../models/api/Submission';
import { Mention } from '../../../../models/api/Mention';
import { CommentThread, CreateCommentThread } from '../../../../models/api/CommentThread';
import { Comment } from '../../../../models/api/Comment';
import { File as APIFile } from '../../../../models/api/File';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { useObservable } from 'observable-hooks';
import { CourseState } from '../../../../models/enums/CourseStateEnum';

export interface APICache<T> {
    observable: Observable<CacheCollection<T> | CacheItem<T>>
}

export interface Refresh<T> extends APICache<T> {
    refresh: () => Promise<boolean>,
    defaultTimeout: number
}

// The create function may take a generic list of arguments, of different types
// tslint:disable-next-line: no-any
export interface Create<Arg extends any[], T> extends APICache<T> {
    create: (...args: Arg) => Promise<T>
}

export function useCollectionAsSingle<T>(observable: Observable<CacheCollection<T>>) {
    return useObservable(() => observable.pipe(
        map(collection => collection.items[0] || emptyCacheItem<T>())
    ), [observable]);
}

export function useCollectionCombined<T>(observable: Observable<CacheCollection<T> | CacheItem<T>>): Observable<CacheItem<T[]>> {
    return useObservable(() => observable.pipe(
        map(collection => {
            if ("items" in collection) {
                const { items, ...props } = collection;
                return {
                    ...props,
                    value: items.map(item => item.value)
                }
            } else {
                const { value, ...props } = collection;
                return {
                    ...props,
                    value: [value]
                }
            }
        }),
    ), [observable])
}

function refreshCollection<T extends { ID: string }>(promise: Promise<T | T[]>, cache: CacheCollectionInterface<T>) {
    return promise.then(result => {
        cache.transaction(cache => {
            if (result instanceof Array) {
                cache.addAll(result, CacheState.Loaded);
            } else {
                cache.add(result, CacheState.Loaded);
            }
        }, result instanceof Array ? CacheState.Loaded : CacheState.Uninitialized);
        return true;
    });
}

function refreshItem<T>(promise: Promise<T>, cache: CacheItemInterface<T>) {
    return promise.then(result => {
        cache.updateItem(old => result, CacheState.Loaded);
        return true;
    });
}

function create<T extends { ID: string }>(promise: Promise<T>, item: T, cache: CacheCollectionInterface<T>) {
    const tempID = randomBytes(32).toString('hex');
    console.log("Creating", tempID);
    cache.transaction(cache => cache.add({ ...item, ID: tempID }, CacheState.Loading));
    return promise
        .then(result => {
            console.log("Creation of", tempID, "succeeded:", result);
            cache.transaction(cache => {
                cache.remove(item => item.ID === tempID);
                cache.add(result, CacheState.Loaded);
            });
            return result;
        })
        .catch((err: Error) => {
            console.log("Creation of", tempID, "failed:", err);
            cache.transaction(cache => {
                cache.remove(item => item.ID === tempID);
            });
            throw err;
        });
}

export function useCourses(): Refresh<Course> & Create<[{ name: string, state: CourseState }], Course> {
    const courses = useCacheCollection<Course>("courses", { 
        sort: (a, b) => 
            // Sort by open first, then by name
            a.state === CourseState.open && b.state !== CourseState.open ? -1 
            : a.state !== CourseState.open && b.state === CourseState.open ? 1 
            : a.name > b.name ? 1 
            : a.name < b.name ? -1 
            : 0
    });
    return {
        observable: courses.observable,
        refresh: () => refreshCollection(API.getCourses(), courses),
        defaultTimeout: 2 * 3600,
        create: ({ name, state }: { name: string, state: CourseState }) => 
            create(
                API.createCourse({ name, state }), 
                { ID: "", name, state, creator: {} as User, currentUserPermission: {} as Permission }, 
                courses
            )
    };
}

export function useCourse(courseID: string): Refresh<Course> {
    const courses = useCacheCollection<Course>("courses", { subKey: courseID, filter: course => course?.ID === courseID });
    const course = useCollectionAsSingle(courses.observable);
    return { 
        observable: course,
        defaultTimeout: 0,
        refresh: () => refreshCollection(API.getCourse(courseID), courses)
    };
}

export function usePermission(): Refresh<Permission> {
    const permission = useCacheItem<Permission>("permission");
    return {
        observable: permission.observable,
        defaultTimeout: 24 * 3600,
        refresh: () => refreshItem(API.permission(), permission)
    }
}

export function useCoursePermission(courseID: string): Refresh<Permission> {
    const permission = useCacheItem<Permission>(`permission/course/${courseID}`);
    return {
        observable: permission.observable,
        defaultTimeout: 24 * 3600,
        refresh: () => refreshItem(API.coursePermission(courseID), permission)
    }
}

export function useCourseSubmissions(courseID: string): Refresh<Submission> & Create<[string, File[]], Submission> {
    const submissions = useCacheCollection<Submission>(`submissions`, { 
        subKey: courseID, 
        filter: submission => submission?.references?.courseID === courseID,
        // Sort by date, newest first
        sort: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    });
    const getCurrentUser = useCurrentUserDirect();
    return {
        observable: submissions.observable,
        refresh: () => refreshCollection(API.getCourseSubmissions(courseID), submissions),
        defaultTimeout: 60,
        create: (projectName: string, files: File[]) => 
            create(
                API.createSubmission(courseID, projectName, files),
                { ID: "", name: projectName, date: new Date(Date.now()).toISOString(), user: getCurrentUser(), state: "new", files: [], references: { courseID } },
                submissions
            )
    }
}

export function useSubmission(submissionID: string): Refresh<Submission> {
    const submissions = useCacheCollection<Submission>(`submissions`, { 
        subKey: submissionID,
        filter: submission => submission?.ID === submissionID 
    });
    const submission = useCollectionAsSingle(submissions.observable);
    return { 
        observable: submission,
        refresh: () => refreshCollection(API.getSubmission(submissionID), submissions),
        defaultTimeout: 0
    };
}

export function useMentions(): Refresh<Mention> {
    const mentions = useCacheCollection<Mention>("mentions", {
        sort: (a, b) => new Date(b.comment.created).getTime() - new Date(a.comment.created).getTime()
    });
    return {
        observable: mentions.observable,
        refresh: () => refreshCollection(API.getMentions(), mentions),
        defaultTimeout: 30
    }
}

export function useCourseMentions(courseID: string): Refresh<Mention> {
    const mentions = useCacheCollection<Mention>("mentions", {
        subKey: courseID,
        filter: mention => mention?.references?.courseID === courseID,
        sort: (a, b) => new Date(b.comment.created).getTime() - new Date(a.comment.created).getTime()
    });
    return {
        observable: mentions.observable,
        refresh: () => refreshCollection(API.getCourseMentions(courseID), mentions),
        defaultTimeout: 30
    }
}

export function useCurrentUser(): Refresh<User> {
    const currentUser = useCacheItem<User>("currentUser");
    return {
        observable: currentUser.observable,
        refresh: () => refreshItem(API.getCurrentUser(), currentUser),
        defaultTimeout: 3 * 24 * 3600
    }
}

/** This is only for internal use in the cache */
function useCurrentUserDirect(): () => User {
    const currentUser = useCacheItem<User>("currentUser");
    return () => currentUser.getCurrentValue().value;
}

function refreshComments(promise: Promise<CommentThread[]>, threads: CacheCollectionInterface<CommentThread>, cache: Cache) {
    return promise.then(result => {
        threads.transaction(threads => {
            for (const thread of result) {
                threads.add({ ...thread, comments: [thread.comments[0]] }, CacheState.Loaded);
                const comments = cache.getCollection<Comment>(`comments/${thread.ID}`);
                comments.transaction(comments => {
                    comments.remove(comment => true);
                    comments.addAll(thread.comments, CacheState.Loaded);
                });
            }
        });
        return true;
    });
}

function createCommentThread(thread: CreateCommentThread, promise: Promise<CommentThread>, threads: CacheCollectionInterface<CommentThread>, getCurrentUser: () => User, cache: Cache) {
    const tempID = randomBytes(32).toString('hex');
    console.log("Creating", tempID);
    const comment = { ID: "", user: getCurrentUser(), text: thread.comment, created: new Date(Date.now()).toISOString(), edited: new Date(Date.now()).toISOString(), references: { submissionID: "", courseID: "", fileID: "", snippetID: "", commentThreadID: "" } };
    threads.transaction(threads => threads.add({ ID: tempID, visibility: thread.visibility, comments: [comment], references: { submissionID: "", courseID: "" } } as CommentThread, CacheState.Loading));
    const tempComments = cache.getCollection<Comment>(`comments/${tempID}`);
    tempComments.transaction(tempComments => tempComments.add(comment, CacheState.Loading));
    return promise.then(thread => {
        console.log("Creation of", tempID, "succeeded:", thread);
        threads.transaction(threads => {
            threads.remove(thread => thread.ID === tempID);
            threads.add(thread, CacheState.Loaded);
        });
        const comments = cache.getCollection<Comment>(`comments/${thread.ID}`);
        comments.transaction(comments =>
            comments.addAll(thread.comments, CacheState.Loaded)
        );
        tempComments.transaction(tempComments => tempComments.clear());
        return thread;
    })
    .catch((err: Error) => {
        console.log("Creation of", tempID, "failed:", err);
        threads.transaction(threads => threads.remove(item => item.ID === tempID));
        tempComments.transaction(tempComments => tempComments.clear());
        throw err;
    });
}

export function useProjectComments(submissionID: string): Refresh<CommentThread> & Create<[CreateCommentThread], CommentThread> {
    const threads = useCacheCollection<CommentThread>(`commentThreads/submission/${submissionID}/project`, {
        sort: (a, b) => new Date(b.comments[0].created).getTime() - new Date(a.comments[0].created).getTime()
    });
    const cache = useRawCache();
    const getCurrentUser = useCurrentUserDirect();
    return {
        observable: threads.observable,
        refresh: () => refreshComments(API.getProjectComments(submissionID), threads, cache),
        defaultTimeout: 30,
        create: (thread: CreateCommentThread) => 
            createCommentThread(
                thread,
                API.createSubmissionCommentThread(submissionID, thread),
                threads,
                getCurrentUser,
                cache
            )
    }
}

export function useRecentComments(submissionID: string): Refresh<CommentThread> {
    const raw = useRawCache();
    const threads = useCacheCollection<CommentThread>(`commentThreads/submission/${submissionID}/files`, {
        sort: (a, b) => new Date(b.comments[0].created).getTime() - new Date(a.comments[0].created).getTime()
    });
    return {
        observable: threads.observable,
        defaultTimeout: 30,
        refresh: () => refreshComments(API.getRecentComments(submissionID), threads, raw)
    }
}

export function useFileComments(submissionID: string, fileID: string): Refresh<CommentThread> & Create<[CreateCommentThread], CommentThread> {
    const threads = useCacheCollection<CommentThread>(`commentThreads/submission/${submissionID}/files`, {
        subKey: fileID,
        filter: thread => thread?.file?.ID === fileID,
        sort: (a, b) => {
            const as = a.snippet, bs = b.snippet;
            return (
                as !== undefined && bs !== undefined 
                // Sort comments with snippets by start position in the file
                ? as.start.line - bs.start.line || as.start.character - bs.start.character
                // Sort general file comments before comments with snippets
                : as === undefined && bs !== undefined ? -1
                : as !== undefined && bs === undefined ? 1
                // Sort general file comments by reverse date
                : new Date(b.comments[0].created).getTime() - new Date(a.comments[0].created).getTime()
            );
        }
    });
    const cache = useRawCache();
    const getCurrentUser = useCurrentUserDirect();
    return {
        observable: threads.observable,
        refresh: () => refreshComments(API.getFileComments(fileID), threads, cache),
        defaultTimeout: 30,
        create: (thread: CreateCommentThread) =>
            createCommentThread(
                thread,
                API.createFileCommentThread(fileID, thread),
                threads,
                getCurrentUser,
                cache
            )
    }
}

export function useComments(commentThreadID: string): Create<[string], Comment> {
    const comments = useCacheCollection<Comment>(`comments/${commentThreadID}`, {
        sort: (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
    });
    const getCurrentUser = useCurrentUserDirect();
    return {
        observable: comments.observable,
        create: (comment: string) => 
            create(
                API.createComment(commentThreadID, comment),
                { ID: "", user: getCurrentUser(), text: comment, created: new Date(Date.now()).toISOString(), edited: new Date(Date.now()).toISOString(), references: { submissionID: "", courseID: "", fileID: "", snippetID: "", commentThreadID: "" } },
                comments
            )
    }
}

export function useFileBody(fileID: string): Refresh<string> {
    const fileBodies = useCacheItem<string>(`file/${fileID}/body`);
    return {
        observable: fileBodies.observable,
        refresh: () => refreshItem(API.getFileContents(fileID), fileBodies),
        defaultTimeout: 0
    }
}

export function useFiles(submissionID: string): Refresh<APIFile[]> {
    const files = useCacheCollection<APIFile>(`file/submission/${submissionID}`);
    const fileList = useCollectionCombined(files.observable);
    return {
        observable: fileList,
        refresh: () => refreshCollection(API.getFiles(submissionID), files),
        defaultTimeout: 0
    }
}

export function useFile(submissionID: string, fileID: string): Refresh<APIFile> {
    const files = useCacheCollection<APIFile>(`file/submission/${submissionID}`, {
        subKey: fileID,
        filter: file => file?.ID === fileID
    });
    const file = useCollectionAsSingle(files.observable);
    return {
        observable: file,
        refresh: () => refreshCollection(API.getFile(fileID), files),
        defaultTimeout: 0
    }
}