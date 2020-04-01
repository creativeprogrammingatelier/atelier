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
    refresh: () => Promise<boolean>
}

export interface Create<Arg extends Array<any>, T> extends APICache<T> {
    create: (...args: Arg) => Promise<boolean>
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
            return true;
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
    const courses = useCacheCollection<Course>("courses");
    return {
        observable: courses.observable,
        refresh: () => refreshCollection(API.getCourses(), courses),
        create: ({ name, state }: { name: string, state: CourseState }) => 
            create(
                API.createCourse({ name, state }), 
                { ID: "", name, state, creator: {} as User, currentUserPermission: {} as Permission }, 
                courses
            )
    };
}

export function useCourse(courseID: string): Refresh<Course> {
    const courses = useCacheCollection<Course>("courses", course => course?.ID === courseID);
    const course = useCollectionAsSingle(courses.observable);
    return { 
        observable: course,
        refresh: () => refreshCollection(API.getCourse(courseID), courses)
    };
}

export function usePermission(): Refresh<Permission> {
    const permission = useCacheItem<Permission>("currentUserPermission");
    return {
        observable: permission.observable,
        refresh: () => refreshItem(API.permission(), permission)
    }
}

export function useCourseSubmissions(courseID: string): Refresh<Submission> & Create<[string, File[]], Submission> {
    const submissions = useCacheCollection<Submission>(`submissions`, submission => submission?.references?.courseID === courseID);
    return {
        observable: submissions.observable,
        refresh: () => refreshCollection(API.getCourseSubmissions(courseID), submissions),
        create: (projectName: string, files: File[]) => 
            create(
                API.createSubmission(courseID, projectName, files),
                { ID: "", name: projectName, date: new Date(Date.now()).toISOString(), user: {} as User, state: "new", files: [], references: { courseID } },
                submissions
            )
    }
}

export function useSubmission(submissionID: string): Refresh<Submission> {
    const submissions = useCacheCollection<Submission>(`submissions`, submission => submission?.ID === submissionID);
    const submission = useCollectionAsSingle(submissions.observable);
    return { 
        observable: submission,
        refresh: () => refreshCollection(API.getSubmission(submissionID), submissions)
    };
}

export function useMentions(): Refresh<Mention> {
    const mentions = useCacheCollection<Mention>("mentions");
    return {
        observable: mentions.observable,
        refresh: () => refreshCollection(API.getMentions(), mentions)
    }
}

export function useCourseMentions(courseID: string): Refresh<Mention> {
    const mentions = useCacheCollection<Mention>("mentions", mention => mention?.references?.courseID === courseID);
    return {
        observable: mentions.observable,
        refresh: () => refreshCollection(API.getCourseMentions(courseID), mentions)
    }
}

export function useCurrentUser(): Refresh<User> {
    const currentUser = useCacheItem<User>("currentUser");
    return {
        observable: currentUser.observable,
        refresh: () => refreshItem(API.getCurrentUser(), currentUser)
    }
}

function refreshComments(promise: Promise<CommentThread[]>, threads: CacheCollectionInterface<CommentThread>, cache: Cache) {
    return promise.then(result => {
        threads.transaction(threads => {
            for (const thread of result) {
                threads.add({ ...thread, comments: [] }, CacheState.Loaded);
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

function createCommentThread(thread: CreateCommentThread, promise: Promise<CommentThread>, threads: CacheCollectionInterface<CommentThread>, cache: Cache) {
    const tempID = randomBytes(32).toString('hex');
    console.log("Creating", tempID);
    threads.transaction(threads => threads.add({ ID: tempID, visibility: thread.visibility, comments: [], references: { submissionID: "", courseID: "" } } as CommentThread, CacheState.Loading));
    const tempComments = cache.getCollection<Comment>(`comments/${tempID}`);
    tempComments.transaction(tempComments => tempComments.add({ ID: "", user: {} as User, text: thread.comment, created: new Date(Date.now()).toISOString(), edited: new Date(Date.now()).toISOString(), references: { submissionID: "", courseID: "", fileID: "", snippetID: "", commentThreadID: "" } }, CacheState.Loading));
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
        return true;
    })
    .catch((err: Error) => {
        console.log("Creation of", tempID, "failed:", err);
        threads.transaction(threads => threads.remove(item => item.ID === tempID));
        tempComments.transaction(tempComments => tempComments.clear());
        throw err;
    });
}

export function useProjectComments(submissionID: string): Refresh<CommentThread> & Create<[CreateCommentThread], CommentThread> {
    const threads = useCacheCollection<CommentThread>(`commentThreads/submission/${submissionID}/project`);
    const cache = useRawCache();
    return {
        observable: threads.observable,
        refresh: () => refreshComments(API.getProjectComments(submissionID), threads, cache),
        create: (thread: CreateCommentThread) => 
            createCommentThread(
                thread,
                API.createSubmissionCommentThread(submissionID, thread),
                threads,
                cache
            )
    }
}

export function useRecentComments(submissionID: string): Refresh<CommentThread> {
    const raw = useRawCache();
    const threads = useCacheCollection<CommentThread>(`commentThreads/submission/${submissionID}/files`);
    return {
        // TODO: sorting
        observable: threads.observable,
        refresh: () => refreshComments(API.getRecentComments(submissionID), threads, raw)
    }
}

export function useFileComments(submissionID: string, fileID: string): Refresh<CommentThread> & Create<[CreateCommentThread], CommentThread> {
    const threads = useCacheCollection<CommentThread>(`commentThreads/submission/${submissionID}/files`, thread => thread?.file?.ID === fileID);
    const cache = useRawCache();
    return {
        observable: threads.observable,
        refresh: () => refreshComments(API.getFileComments(fileID), threads, cache),
        create: (thread: CreateCommentThread) =>
            createCommentThread(
                thread,
                API.createFileCommentThread(fileID, thread),
                threads,
                cache
            )
    }
}

export function useComments(commentThreadID: string): Create<[string], Comment> {
    const comments = useCacheCollection<Comment>(`comments/${commentThreadID}`);
    return {
        observable: comments.observable,
        create: (comment: string) => 
            create(
                API.createComment(commentThreadID, comment),
                { ID: "", user: {} as User, text: comment, created: new Date(Date.now()).toISOString(), edited: new Date(Date.now()).toISOString(), references: { submissionID: "", courseID: "", fileID: "", snippetID: "", commentThreadID: "" } },
                comments
            )
    }
}

export function useFileBody(fileID: string): Refresh<string> {
    const fileBodies = useCacheItem<string>(`file/${fileID}/body`);
    return {
        observable: fileBodies.observable,
        refresh: () => refreshItem(API.getFileContents(fileID), fileBodies)
    }
}

export function useFiles(submissionID: string): Refresh<APIFile[]> {
    const files = useCacheCollection<APIFile>(`file/submission/${submissionID}`);
    const fileList = useCollectionCombined(files.observable);
    return {
        observable: fileList,
        refresh: () => refreshCollection(API.getFiles(submissionID), files)
    }
}

export function useFile(submissionID: string, fileID: string): Refresh<APIFile> {
    const files = useCacheCollection<APIFile>(`file/submission/${submissionID}`, file => file?.ID === fileID);
    const file = useCollectionAsSingle(files.observable);
    return {
        observable: file,
        refresh: () => refreshCollection(API.getFile(fileID), files)
    }
}