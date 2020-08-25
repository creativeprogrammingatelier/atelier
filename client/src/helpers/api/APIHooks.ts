import {randomBytes} from 'crypto';
import {useObservable} from 'observable-hooks';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {Comment} from '../../../../models/api/Comment';
import {CommentThread, CreateCommentThread} from '../../../../models/api/CommentThread';
import {Course} from '../../../../models/api/Course';
import {File as APIFile} from '../../../../models/api/File';
import {Mention} from '../../../../models/api/Mention';
import {Permission} from '../../../../models/api/Permission';
import {Submission} from '../../../../models/api/Submission';
import {User} from '../../../../models/api/User';
import {CourseState} from '../../../../models/enums/CourseStateEnum';
import {ThreadState} from '../../../../models/enums/ThreadStateEnum';

import * as API from '../../helpers/api/APIHelper';

import {useCacheItem, useCacheCollection, useRawCache} from '../../components/general/loading/CacheProvider';

import {
	Cache,
	CacheState,
	CacheCollection,
	CacheItem,
	CacheCollectionInterface,
	emptyCacheItem,
	CacheItemInterface
} from './Cache';
import { FeedItem } from '../../../../models/api/FeedItem';
import { PaginationParameters } from '../ParameterHelper';

/** 
 * API Hooks for using data from the API in React 
 */

// Interfaces for API Hooks
/**
 * A cached API endpoint
 */
export interface APICache<T> {
	/** Observable for the collection or item */
	observable: Observable<CacheCollection<T> | CacheItem<T>>
}

/**
 * A refreshable cache can be refreshed with a request to the API.
 * When calling refresh, all data in the cache will be replaced with the results
 * returned by the API, which means that older data may be lost. On endpoints
 * with support for pagination, this should not be called too often. (Still should 
 * be called once in a while to make sure deleted items get purged, since we have
 * no update mechanism for that.)
 */
export interface Refresh<T> extends APICache<T> {
	/** 
	 * Refresh the data in the cache, returning true if the request 
	 * is successful or rejecting the promise if not 
	 */
	refresh: () => Promise<boolean>,
	/** The default time to wait before refreshing this type of data */
	defaultTimeout: number
}

/**
 * You can create new items in this type of cache
 * The create function may take a generic list of arguments, of different types
 */
// tslint:disable-next-line: no-any
export interface Create<Arg extends any[], T> extends APICache<T> {
	/** 
	 * Takes a generic set of arguments, returning the created 
	 * item, or rejecting the promise if the API request fails
	 */
	create: (...args: Arg) => Promise<T>
}

/**
 * You can update the items stored in this type of cache
 * The update function may take a generic list of arguments, of different types
 */
// tslint:disable-next-line: no-any
export interface Update<Arg extends any[], T> extends APICache<T> {
	/** 
	 * Takes a generic set of arguments, returning the updated
	 * item, or rejecting the promise if the API request fails
	 */
	update: (...args: Arg) => Promise<T>
}

/**
 * Items in this type of cache can be deleted
 * The delete function may take a generic list of arguments, of different types
 */
// tslint:disable-next-line: no-any
export interface Delete<Arg extends any[], T> extends APICache<T> {
	/** 
	 * Takes a generic set of arguments, returning the deleted
	 * item, or rejecting the promise if the API request fails
	 */
	delete: (...args: Arg) => Promise<T>
}

/**
 * Items in this type of cache support pagination, so you can load more items into the cache,
 * or check if new items have appeared.
 */
// tslint:disable-next-line: no-any
export interface LoadMore<T> extends APICache<T> {
    loadNew: () => Promise<boolean>,
    loadMore: (until: number) => Promise<boolean>
}

// Generic helper functions

/**
 * Helper function to get a single item from a CacheCollection
 */
export function useCollectionAsSingle<T>(observable: Observable<CacheCollection<T>>) {
	return useObservable(() => observable.pipe(
		map(collection => collection.items[0] || emptyCacheItem<T>())
	), [observable]);
}

/**
 * Helper function to use a `CacheCollection<T>` as a `CacheItem<T[]>`
 */
export function useCollectionCombined<T>(observable: Observable<CacheCollection<T> | CacheItem<T>>): Observable<CacheItem<T[]>> {
	return useObservable(() => observable.pipe(
		map(collection => {
			if ("items" in collection) {
				const {items, ...props} = collection;
				return {
					...props,
					value: items.map(item => item.value)
				}
			} else {
				const {value, ...props} = collection;
				return {
					...props,
					value: [value]
				}
			}
		}),
	), [observable])
}

/**
 * Helper function for refreshing comments and threads
 */
function refreshComments(promise: Promise<CommentThread[]>, threads: CacheCollectionInterface<CommentThread>, cache: Cache) {
	return promise.then(result => {
		threads.transaction(threads => {
			for (const thread of result) {
				threads.add({...thread, comments: [thread.comments[0]]}, CacheState.Loaded);
				const comments = cache.getCollection<Comment>(`comments/${thread.ID}`);
				comments.transaction(comments => {
					comments.remove(() => true);
					comments.addAll(thread.comments, CacheState.Loaded);
				});
			}
		});
		return true;
	});
}

/**
 * Helper function for creating a new comment thread
 */
function createCommentThread(thread: CreateCommentThread, promise: Promise<CommentThread>, threads: CacheCollectionInterface<CommentThread>, getCurrentUser: () => User, cache: Cache) {
	const tempID = randomBytes(32).toString('hex');
	console.log("Creating", tempID);
	const comment = {
		ID: "",
		user: getCurrentUser(),
		text: thread.comment,
		created: new Date(Date.now()).toISOString(),
		edited: new Date(Date.now()).toISOString(),
		references: {submissionID: "", courseID: "", fileID: "", snippetID: "", commentThreadID: ""}
	};
	threads.transaction(threads => threads.add({
		ID: tempID,
		visibility: thread.visibility,
		comments: [comment],
		references: {submissionID: "", courseID: ""}
	} as CommentThread, CacheState.Loading));
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

/**
 * Generic refresh function for a CacheCollection
 * @param promise the promise that will return the new data
 * @param cache the cache to store the data in
 * @returns promise of true if the request was successful, a rejected promise if not
 */
async function refreshCollection<T extends { ID: string }>(promise: Promise<T | T[]>, cache: CacheCollectionInterface<T>) {
	const result = await promise;
	cache.transaction(cache => {
		if (result instanceof Array) {
			cache.addAll(result, CacheState.Loaded);
		}
		else {
			cache.add(result, CacheState.Loaded);
		}
	}, result instanceof Array ? CacheState.Loaded : CacheState.Uninitialized);
	return true;
}

/**
 * Generic refresh function for a CacheItem
 * @param promise the promise that will return the new item
 * @param cache the cache to store the data in
 * @returns promise of true if the request was successful, a rejected promise if not
 */
async function refreshItem<T>(promise: Promise<T>, cache: CacheItemInterface<T>) {
	const result = await promise;
	cache.updateItem(() => result, CacheState.Loaded);
	return true;
}

/**
 * Generic create function to create a new item in a collection
 * @param promise the promise that will return the created item
 * @param item the temporary item to store in the cache
 * @param cache the cache to store the data in
 * @returns promise of the new item, or a rejected promise if unsuccessful
 */
async function create<T extends { ID: string }>(promise: Promise<T>, item: T, cache: CacheCollectionInterface<T>) {
	const tempID = randomBytes(32).toString('hex');
	console.log("Creating", tempID);
	cache.transaction(cache => cache.add({...item, ID: tempID}, CacheState.Loading));
	try {
		const result = await promise;
		console.log("Creation of", tempID, "succeeded:", result);
		cache.transaction(cache => {
			cache.remove(item => item.ID === tempID);
			cache.add(result, CacheState.Loaded);
		});
		return result;
	}
	catch (err) {
		console.log("Creation of", tempID, "failed:", err);
		cache.transaction(cache => {
			cache.remove(item => item.ID === tempID);
		});
		throw err;
	}
}

/**
 * Create a new object with new values for some fields, while keeping other fields the same
 */
function updateModel<T>(old: T, update: Partial<T>): T {
	// The update object may have fields of any type
	// tslint:disable-next-line: no-any
	const updateMap = update as { [key: string]: any };
	return Object.assign({},
		old,
		...Object.keys(updateMap)
			.filter(key => updateMap[key] !== undefined)
			.map(key => ({[key]: updateMap[key]}))
	);
}

/**
 * Generic update function to update an item in a collection
 * @param promise the promise that will return the updated item
 * @param update item with values in updated fields, or undefined for fields that should stay the same
 * @param cache the cache to store the data in
 */
async function update<T extends { ID: string } & Res, Res>(promise: Promise<Res>, update: Partial<T> & { ID: string }, cache: CacheCollectionInterface<T>) {
	const [oldItem] = cache.getCurrentValue().items.filter(({value}) => update.ID === value.ID);
	cache.transaction(cache => cache.add(updateModel(oldItem.value, update), CacheState.Loading));
	try {
		const result = await promise;
		const newItem = updateModel(oldItem.value, result);
		cache.transaction(cache => cache.add(newItem, CacheState.Loaded));
		return newItem;
	}
	catch (err) {
		cache.transaction(cache => cache.add(oldItem.value, oldItem.state));
		throw err;
	}
}

/**
 * Generic update function to update a single cacheItem
 * @param promise the promise that will return the updated item
 * @param update item iwth values in updated fields, or undefined for fields that should stay the same
 * @param cache the cache to store the data in
 */
async function updateItem<T extends Res, Res>(promise: Promise<Res>, update: Partial<T>, cache: CacheItemInterface<T>) {
    const oldItem = cache.getCurrentValue();
    cache.updateItem(old => updateModel(old, update), CacheState.Loading);
    try {
        const result = await promise;
        cache.updateItem(old => updateModel(old, result), CacheState.Loaded);
        return cache.getCurrentValue().value;
    } catch (err) {
        cache.updateItem(_ => oldItem.value, oldItem.state);
        throw err;
    }
}

/**
 * Generic delete function to remove items from a collection
 * @param promise the promise that will return the deleted item
 * @param selector selector for items to delete
 * @param cache the cache to delete the items from
 */
async function deleteItem<T extends { ID: string }>(promise: Promise<T>, selector: (item: T) => boolean, cache: CacheCollectionInterface<T>) {
	const oldItems = cache.getCurrentValue().items.filter(({value}) => selector(value));
	cache.transaction(cache => cache.remove(selector));
	try {
		return promise;
	}
	catch (err) {
		cache.transaction(cache => cache.addAll(oldItems.map(({ value }) => value), CacheState.Loaded));
		throw err;
	}
}

/** This is only for internal use in the cache */
function useCurrentUserDirect(): () => User {
	const currentUser = useCacheItem<User>("currentUser");
	return () => currentUser.getCurrentValue().value;
}

// API Hooks
////////////
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
		create: ({name, state}: { name: string, state: CourseState }) =>
			create(
				API.createCourse({name, state}),
				{ID: "", name, state, creator: {} as User, currentUserPermission: {} as Permission},
				courses
			)
	};
}
export function useCourse(courseID: string): Refresh<Course> & Update<[{ name?: string, state?: CourseState }], Course> & Delete<[], Course> {
	const courses = useCacheCollection<Course>("courses", {
		subKey: courseID,
		filter: course => course?.ID === courseID
	});
	const course = useCollectionAsSingle(courses.observable);
	return {
		observable: course,
		defaultTimeout: 0,
		refresh: () => refreshCollection(API.getCourse(courseID), courses),
		update: ({name, state}: { name?: string, state?: CourseState }) =>
			update(
				API.updateCourse(courseID, {name, state}),
				{ID: courseID, name, state},
				courses
			),
		delete: () => 
			deleteItem(
				API.deleteCourse(courseID).then(cp => ({ ...cp, currentUserPermission: {} as Permission })),
				course => course.ID === courseID,
				courses
			)
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
export function useCourseSubmissions(courseID: string): Refresh<Submission> & Create<[string, File[]], Submission> & LoadMore<Submission> {
	const submissions = useCacheCollection<Submission>(`submissions`, {
		subKey: courseID,
		filter: submission => submission?.references?.courseID === courseID,
		// Sort by date, newest first
		sort: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	});
    const getCurrentUser = useCurrentUserDirect();
    const getDates = () => submissions.getCurrentValue().items.map(x => new Date(x.value.date).getTime());
	return {
		observable: submissions.observable,
		refresh: () => refreshCollection(API.getCourseSubmissions(courseID, { limit: 50 }), submissions),
        defaultTimeout: 60,
        loadNew: () => refreshCollection(API.getCourseSubmissions(courseID, { after: Math.max(...getDates()) }), submissions),
        loadMore: (until) => refreshCollection(API.getCourseSubmissions(courseID, { before: Math.min(...getDates()), after: until }), submissions),
		create: (projectName: string, files: File[]) =>
			create(
				API.createSubmission(courseID, projectName, files),
				{
					ID: "",
					name: projectName,
					date: new Date(Date.now()).toISOString(),
					user: getCurrentUser(),
					state: "new",
					files: [],
					references: {courseID}
				},
				submissions
			)
	}
}
export function usePersonalFeed(courseID?: string): Refresh<FeedItem> & LoadMore<FeedItem> {
    const feed = useCacheCollection<FeedItem>("personalFeed", {
        subKey: courseID,
        filter: courseID ? item => item.data.references.courseID === courseID : _ => true,
        // Sort by date, newest first
        sort: (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    });
    const getDates = () => feed.getCurrentValue().items.map(x => new Date(x.value.timestamp).getTime());
    const apiGet = (params: PaginationParameters) => courseID ? API.getPersonalCourseFeed(courseID, params) : API.getPersonalFeed(params);
    return {
        observable: feed.observable,
        defaultTimeout: 20,
        refresh: () => refreshCollection(apiGet({ limit: 50 }), feed),
        loadNew: () => refreshCollection(apiGet({ after: Math.max(...getDates()) }), feed),
        loadMore: (until) => refreshCollection(apiGet({ before: Math.min(...getDates()), after: until }), feed)
    }
}
export function useCourseFeed(courseID: string): Refresh<FeedItem> & LoadMore<FeedItem> {
    const feed = useCacheCollection<FeedItem>(`courseFeed/${courseID}`, {
        // Sort by date, newest first
        sort: (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    });
    const getDates = () => feed.getCurrentValue().items.map(x => new Date(x.value.timestamp).getTime());
    return {
        observable: feed.observable,
        defaultTimeout: 30,
        refresh: () => refreshCollection(API.getCourseFeed(courseID, { limit: 50 }), feed),
        loadNew: () => refreshCollection(API.getCourseFeed(courseID, { after: Math.max(...getDates()) }), feed),
        loadMore: until => refreshCollection(API.getCourseFeed(courseID, { before: Math.min(...getDates()), after: until }), feed)
    }
}
export function useSubmission(submissionID: string): Refresh<Submission> & Delete<[], Submission> {
	const submissions = useCacheCollection<Submission>(`submissions`, {
		subKey: submissionID,
		filter: submission => submission?.ID === submissionID
	});
	const submission = useCollectionAsSingle(submissions.observable);
	return {
		observable: submission,
		refresh: () => refreshCollection(API.getSubmission(submissionID), submissions),
		defaultTimeout: 0,
		delete: () =>
			deleteItem(
				API.deleteSubmission(submissionID),
				submission => submission.ID === submissionID,
				submissions
			)
	};
}
export function useMentions(): Refresh<Mention> & LoadMore<Mention> {
	const mentions = useCacheCollection<Mention>("mentions", {
		sort: (a, b) => new Date(b.comment.created).getTime() - new Date(a.comment.created).getTime()
    });
    const getDates = () => mentions.getCurrentValue().items.map(x => new Date(x.value.comment.created).getTime())
	return {
		observable: mentions.observable,
		refresh: () => refreshCollection(API.getMentions(), mentions),
        defaultTimeout: 30,
        loadNew: () => refreshCollection(API.getMentions({ after: Math.max(...getDates()) }), mentions),
        loadMore: (until) => refreshCollection(API.getMentions({ before: Math.min(...getDates()), after: until }), mentions)
	}
}
export function useCourseMentions(courseID: string): Refresh<Mention> & LoadMore<Mention> {
	const mentions = useCacheCollection<Mention>("mentions", {
		subKey: courseID,
		filter: mention => mention?.references?.courseID === courseID,
		sort: (a, b) => new Date(b.comment.created).getTime() - new Date(a.comment.created).getTime()
    });
    const getDates = () => mentions.getCurrentValue().items.map(x => new Date(x.value.comment.created).getTime())
	return {
		observable: mentions.observable,
		refresh: () => refreshCollection(API.getCourseMentions(courseID), mentions),
        defaultTimeout: 30,
        loadNew: () => refreshCollection(API.getCourseMentions(courseID, { after: Math.max(...getDates()) }), mentions),
        loadMore: (until) => refreshCollection(API.getCourseMentions(courseID, { before: Math.min(...getDates()), after: until }), mentions)
	}
}
export function useCurrentUser(): Refresh<User> & Update<[Partial<User>], User> {
	const currentUser = useCacheItem<User>("currentUser");
	return {
		observable: currentUser.observable,
		defaultTimeout: 3 * 24 * 3600,
        refresh: () => refreshItem(API.getCurrentUser(), currentUser),
        update: (updatedUser) =>
			updateItem(
				API.setUser(updatedUser),
				updatedUser,
				currentUser
			)
	}
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
export function useCommentThread(submissionID: string, threadID: string, fileID?: string): Update<[ThreadState], CommentThread> & Delete<[], CommentThread> {
	const threads =
		fileID !== undefined
			? useCacheCollection<CommentThread>(`commentThreads/submission/${submissionID}/files`, {
				subKey: fileID,
				filter: thread => thread.ID === threadID
			})
			: useCacheCollection<CommentThread>(`commentThreads/submission/${submissionID}/project`, {filter: thread => thread.ID === threadID});
	const thread = useCollectionAsSingle(threads.observable);
	return {
		observable: thread,
		update: (visibility: ThreadState) =>
			update(
				API.setCommentThreadVisibility(threadID, visibility).then(thread => ({
					...thread,
					comments: undefined as unknown as Comment[]
				})),
				{ID: threadID, visibility},
				threads
			),
		delete: () => deleteItem(API.deleteCommentThread(threadID), thread => thread.ID === threadID, threads)
	}
}
export function useComments(commentThreadID: string): Create<[string], Comment> & Update<[string, string], Comment> & Delete<[string], Comment> {
	const comments = useCacheCollection<Comment>(`comments/${commentThreadID}`, {
		sort: (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
	});
	const getCurrentUser = useCurrentUserDirect();
	return {
		observable: comments.observable,
		create: (comment: string) =>
			create(
				API.createComment(commentThreadID, comment),
				{
					ID: "",
					user: getCurrentUser(),
					text: comment,
					created: new Date(Date.now()).toISOString(),
					edited: new Date(Date.now()).toISOString(),
					references: {submissionID: "", courseID: "", fileID: "", snippetID: "", commentThreadID: ""}
				},
				comments
			),
		update: (commentID: string, comment: string) =>
			update(
				API.editComment(commentThreadID, commentID, comment),
				{ID: commentID, text: comment},
				comments
			),
		delete: (commentID: string) =>
			update(
				API.deleteComment(commentThreadID, commentID),
				{ID: commentID, text: "This comment was deleted"},
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
