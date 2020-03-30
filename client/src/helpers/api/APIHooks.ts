import { CacheState, CacheInterface, CacheCollection, getCacheInterface } from './Cache';
import { Course } from '../../../../models/api/Course';
import * as API from '../../../helpers/APIHelper';
import { courseState } from '../../../../models/enums/courseStateEnum';
import { randomBytes } from 'crypto';
import { User } from '../../../../models/api/User';
import { Permission } from '../../../../models/api/Permission';
import { globalRole } from '../../../../models/enums/globalRoleEnum';
import { Messaging, useMessaging } from '../../components/feedback/MessagingProvider';
import { useCache, CacheContext, useRawCache } from '../../components/general/loading/CacheProvider';
import { Submission } from '../../../../models/api/Submission';
import { Mention } from '../../../../models/api/Mention';
import { CommentThread, CreateCommentThread } from '../../../../models/api/CommentThread';
import { Comment } from '../../../../models/api/Comment';
import { File as APIFile } from '../../../../models/api/File';

function refresh<T>(promise: Promise<T[]>, cache: CacheInterface<T>, messaging: Messaging, selector?: (item: T) => boolean) {
    cache.setCollectionState(CacheState.Loading);
    promise
        .then(result => cache.replaceAll(result, CacheState.Loaded, selector))
        .catch((err: Error) => {
            messaging.addMessage({ type: "danger", message: err.message })
        });
}

function create<T extends { ID: string }>(promise: Promise<T>, item: T, cache: CacheInterface<T>, messaging: Messaging) {
    const tempID = randomBytes(32).toString('hex');
    console.log("Creating", tempID);
    cache.add({ ...item, ID: tempID }, CacheState.Loading);
    return promise
        .then(result => {
            console.log("Creation of", tempID, "succeeded:", result);
            cache.replace(old => old.ID === tempID, result, CacheState.Loaded);
            return true;
        })
        .catch((err: Error) => {
            messaging.addMessage({ type: "danger", message: err.message }),
            cache.remove(item => item.ID === tempID);
            return false;
        });
}

function filter<T>(collection: CacheCollection<T>, selector: (item: T) => boolean) {
    return {
        ...collection,
        items: collection.items.filter(item => selector(item.item))
    };
}

export function useCourses() {
    const cache = useCache<Course>("courses");
    const messages = useMessaging();

    const refreshCourses = () => refresh(API.getCourses(), cache, messages);
    const createCourse = ({ name, state }: { name: string, state: courseState }) => 
        create(
            API.createCourse({ name, state }), 
            { ID: "", name, state, creator: {} as User, currentUserPermission: {} as Permission }, 
            cache, 
            messages
        );

    return {
        courses: cache.collection,
        createCourse,
        refreshCourses
    };
}

export function useCourse(courseID: string) {
    const cache = useCache<Course>("courses");
    const messaging = useMessaging();
    
    let course = cache.collection.items.find(({ item }) => item.ID === courseID);

    if (course === undefined) {
        API.getCourse(courseID)
            .then(result => cache.add(result, CacheState.Loaded))
            .catch((err: Error) => {
                messaging.addMessage({ type: "danger", message: err.message })
            });
        course = { item: { ID: courseID, name: "Loading", state: courseState.hidden, creator: {} as User, currentUserPermission: {} as Permission }, state: CacheState.Loading }
    }

    return { course };
}

export function usePermission() {
    const cache = useCache<Permission>("currentUserPermission");
    const messages = useMessaging();

    const refreshPermission = () => refresh(API.permission().then(p => [p]), cache, messages);

    if (cache.collection.state === CacheState.Uninitialized) refreshPermission();

    return {
        permission: cache.collection.items[0] || { item: { permissions: 0, globalRole: globalRole.unregistered }, state: cache.collection.state },
        refreshPermission
    }
}

export function useCourseSubmissions(courseID: string) {
    const cache = useCache<Submission>(`submissions`);
    const messages = useMessaging();

    const refreshSubmissions = () => refresh(API.getCourseSubmissions(courseID), cache, messages, submission => submission.references.courseID === courseID);
    const createSubmission = (projectName: string, files: File[]) => 
        create(
            API.createSubmission(courseID, projectName, files),
            { ID: "", name: projectName, date: new Date(Date.now()).toISOString(), user: {} as User, state: "new", files: [], references: { courseID } },
            cache,
            messages
        );

    return {
        submissions: filter(cache.collection, submission => submission.references.courseID === courseID),
        createSubmission,
        refreshSubmissions
    }
}

export function useSubmission(submissionID: string) {
    const cache = useCache<Submission>(`submissions`);
    const messaging = useMessaging();

    let submission = cache.collection.items.find(({ item }) => item.ID === submissionID);

    if (submission === undefined) {
        API.getSubmission(submissionID)
            .then(result => cache.add(result, CacheState.Loaded))
            .catch((err: Error) => {
                messaging.addMessage({ type: "danger", message: err.message })
            });
        submission = { item: { ID: submissionID, name: "Loading", date: new Date(Date.now()).toISOString(), user: {} as User, state: "new", files: [], references: { courseID: "" } }, state: CacheState.Loading }
    }

    return { submission };
}

export function useMentions() {
    const cache = useCache<Mention>("mentions");
    const messaging = useMessaging();

    const refreshMentions = () => refresh(API.getMentions(), cache, messaging);

    return {
        mentions: cache.collection,
        refreshMentions
    }
}

export function useCourseMentions(courseID: string) {
    const cache = useCache<Mention>("mentions");
    const messaging = useMessaging();

    const refreshMentions = () => refresh(API.getCourseMentions(courseID), cache, messaging, mention => mention.references.courseID === courseID);

    return {
        mentions: filter(cache.collection, mention => mention.references.courseID === courseID),
        refreshMentions
    }
}

export function useCurrentUser() {
    const cache = useCache<User>("currentUser");
    const messaging = useMessaging();

    const refreshUser = () => refresh(API.getCurrentUser().then(u => [u]), cache, messaging);

    if (cache.collection.state === CacheState.Uninitialized) refreshUser();

    return {
        user: cache.collection.items[0] || { item: { ID: "", name: "Loading", email: "", permission: {} as Permission }, state: cache.collection.state },
        refreshUser
    }
}

function refreshComments(promise: Promise<CommentThread[]>, threadCache: CacheInterface<CommentThread>, rawCache: CacheContext, messaging: Messaging, selector?: (ct: CommentThread) => boolean) {
    threadCache.setCollectionState(CacheState.Loading);
    promise
        .then(result => {
            if (selector) {
                threadCache.replaceAll(result.map(thread => ({ ...thread, comments: [] })), CacheState.Loaded, selector);
            }
            for (const thread of result) {
                if (!selector) {
                    threadCache.replace(c => c.ID === thread.ID, { ...thread, comments: [] }, CacheState.Loaded);
                }
                const commentCache = getCacheInterface(`comments/${thread.ID}`, rawCache.cache, rawCache.updateCache);
                commentCache.replaceAll(thread.comments, CacheState.Loaded);
            }
        })
        .catch((err: Error) => {
            messaging.addMessage({ type: "danger", message: err.message })
        });
}

function createCommentThread(thread: CreateCommentThread, promise: Promise<CommentThread>, threadCache: CacheInterface<CommentThread>, rawCache: CacheContext, messaging: Messaging) {
    const tempID = randomBytes(32).toString('hex');
    console.log("Creating", tempID);
    threadCache.add({ ID: tempID, visibility: thread.visibility, comments: [], references: { submissionID: "", courseID: "" } } as CommentThread, CacheState.Loading);
    const tempCommentCache = getCacheInterface(`comments/${tempID}`, rawCache.cache, rawCache.updateCache);
    tempCommentCache.add({ ID: "", user: {} as User, text: thread.comment, created: new Date(Date.now()).toISOString(), edited: new Date(Date.now()).toISOString(), references: { submissionID: "", courseID: "", fileID: "", snippetID: "", commentThreadID: "" } }, CacheState.Loading);
    return promise
        .then(thread => {
            console.log("Creation of", tempID, "succeeded:", thread);
            threadCache.replace(old => old.ID === tempID, thread, CacheState.Loaded);
            const commentCache = getCacheInterface(`comments/${thread.ID}`, rawCache.cache, rawCache.updateCache)
            commentCache.replaceAll(thread.comments, CacheState.Loaded);
            tempCommentCache.clear();
            return true;
        })
        .catch((err: Error) => {
            messaging.addMessage({ type: "danger", message: err.message }),
            threadCache.remove(item => item.ID === tempID);
            tempCommentCache.clear();
            return false;
        });
}

export function useProjectComments(submissionID: string) {
    const raw = useRawCache();
    const cache = useCache<CommentThread>(`commentThreads/submission/${submissionID}`);
    const messaging = useMessaging();

    const refreshProjectComments = () => refreshComments(API.getProjectComments(submissionID), cache, raw, messaging, ct => ct.file === undefined);
    const createProjectComment = (thread: CreateCommentThread) => 
        createCommentThread(
            thread,
            API.createSubmissionCommentThread(submissionID, thread),
            cache,
            raw,
            messaging
        );

    return {
        projectComments: filter(cache.collection, ct => ct.file === undefined),
        refreshProjectComments,
        createProjectComment
    }
}

export function useRecentComments(submissionID: string) {
    const raw = useRawCache();
    const cache = useCache<CommentThread>(`commentThreads/submission/${submissionID}`);
    const messaging = useMessaging();

    const refreshRecentComments = () => refreshComments(API.getRecentComments(submissionID), cache, raw, messaging);

    return {
        // TODO: sorting
        recentComments: cache.collection,
        refreshRecentComments
    }
}

export function useFileComments(submissionID: string, fileID: string) {
    const raw = useRawCache();
    const cache = useCache<CommentThread>(`commentThreads/submission/${submissionID}`);
    const messaging = useMessaging();

    const refreshFileComments = () => refreshComments(API.getFileComments(fileID), cache, raw, messaging, ct => ct.file?.ID === fileID);
    const createFileComment = (thread: CreateCommentThread) => 
        createCommentThread(
            thread,
            API.createFileCommentThread(fileID, thread),
            cache,
            raw,
            messaging
        );

    return {
        fileComments: filter(cache.collection, ct => ct.file?.ID === fileID),
        refreshFileComments,
        createFileComment
    }
}

export function useComments(commentThreadID: string) {
    const cache = useCache<Comment>(`comments/${commentThreadID}`);
    const messaging = useMessaging();

    const createReply = (comment: string) =>
        create(
            API.createComment(commentThreadID, comment),
            { ID: "", user: {} as User, text: comment, created: new Date(Date.now()).toISOString(), edited: new Date(Date.now()).toISOString(), references: { submissionID: "", courseID: "", fileID: "", snippetID: "", commentThreadID: "" } },
            cache,
            messaging
        );

    return {
        comments: cache.collection,
        createReply
    }
}

export function useFileBody(fileID: string) {
    const cache = useCache<string>(`file/${fileID}/body`);
    const messaging = useMessaging();

    const refreshFileBody = () => refresh(API.getFileContents(fileID).then(f => [f]), cache, messaging);

    if (cache.collection.state === CacheState.Uninitialized) refreshFileBody();

    return {
        fileBody: cache.collection.items[0] || { item: "", state: cache.collection.state },
        refreshFileBody
    }
}

export function useFiles(submissionID: string) {
    const cache = useCache<APIFile>(`file/submission/${submissionID}`);
    const messaging = useMessaging();

    const refreshFiles = () => refresh(API.getFiles(submissionID), cache, messaging);
    
    return {
        files: cache.collection,
        refreshFiles
    }
}

export function useFile(submissionID: string, fileID: string) {
    const cache = useCache<APIFile>(`file/submission/${submissionID}`);
    const messaging = useMessaging();

    let file = cache.collection.items.find(({ item }) => item.ID === fileID);

    if (file === undefined) {
        API.getFile(fileID)
            .then(result => cache.add(result, CacheState.Loaded))
            .catch((err: Error) => {
                messaging.addMessage({ type: "danger", message: err.message })
            });
        file = { item: { ID: fileID, name: "Loading", type: "undefined/undefined", references: { submissionID, courseID: "" } }, state: CacheState.Loading }
    }

    return { file };
}