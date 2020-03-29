import { CacheState, CacheInterface } from './Cache';
import { Course } from '../../../../models/api/Course';
import * as API from '../../../helpers/APIHelper';
import { courseState } from '../../../../models/enums/courseStateEnum';
import { randomBytes } from 'crypto';
import { User } from '../../../../models/api/User';
import { Permission } from '../../../../models/api/Permission';
import { globalRole } from '../../../../models/enums/globalRoleEnum';
import { Messaging, useMessaging } from '../../components/feedback/MessagingProvider';
import { useCache } from '../../components/general/loading/CacheProvider';
import { Submission } from '../../../../models/api/Submission';

function refresh<T>(promise: Promise<T[]>, cache: CacheInterface<T>, messaging: Messaging) {
    cache.setCollectionState(CacheState.Loading);
    promise
        .then(result => cache.replaceAll(result, CacheState.Loaded))
        .catch((err: Error) => {
            messaging.addMessage({ type: "danger", message: err.message })
        });
}

function create<T extends { ID: string }>(promise: Promise<T>, item: T, cache: CacheInterface<T>, messaging: Messaging) {
    const tempID = randomBytes(32).toString('hex');
    console.log("Creating", tempID);
    cache.add({ ...item, ID: tempID }, CacheState.Loading);
    promise
        .then(result => {
            console.log("Creation of", tempID, "succeeded:", result);
            cache.replace(old => old.ID === tempID, result, CacheState.Loaded);
        })
        .catch((err: Error) => {
            messaging.addMessage({ type: "danger", message: err.message }),
            cache.remove(item => item.ID === tempID);
        });
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

export function useSubmissions(courseID: string) {
    const cache = useCache<Submission>(`submission/course/${courseID}`);
    const messages = useMessaging();

    const refreshSubmissions = () => refresh(API.getCourseSubmissions(courseID), cache, messages);
    const createSubmission = (projectName: string, files: File[]) => 
        create(
            API.createSubmission(courseID, projectName, files),
            { ID: "", name: projectName, date: new Date(Date.now()).toISOString(), user: {} as User, state: "new", files: [], references: { courseID } },
            cache,
            messages);

    return {
        submissions: cache.collection,
        createSubmission,
        refreshSubmissions
    }
}