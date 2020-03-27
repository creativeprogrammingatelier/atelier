import React, { useContext, createContext, useState, useEffect } from 'react';
import { Cache, getCacheInterface, Update, CacheState, CacheInterface } from './Cache';
import { Course } from '../../../../models/api/Course';
import * as API from '../../../helpers/APIHelper';
import { courseState } from '../../../../models/enums/courseStateEnum';
import { randomBytes } from 'crypto';
import { User } from '../../../../models/api/User';
import { Permission } from '../../../../models/api/Permission';
import { globalRole } from '../../../../models/enums/globalRoleEnum';
import { Messaging, useMessaging } from '../../components/feedback/Messaging';

interface API {
    readonly cache: Cache,
}

interface APIContext {
    readonly api: API,
    readonly updateAPI: Update<API>
}

const apiContext = createContext<APIContext>({ api: { cache: {} }, updateAPI: f => {} })

export function APIProvider({ children }: { children: React.ReactNode }) {
    const cache = JSON.parse(localStorage.getItem("cache") || "{}");
    const [api, updateAPI] = useState<API>({ cache });

    useEffect(() => {
        localStorage.setItem("cache", JSON.stringify(api.cache));
    }, [api]);

    return <apiContext.Provider value={{api, updateAPI}} children={children} />;
}

export function useCache<T>(key: string) {
    const { api, updateAPI } = useContext(apiContext);
    const updateCache: Update<Cache> = update => updateAPI(api => ({ ...api, cache: update(api.cache) }));
    return getCacheInterface<T>(key, api.cache, updateCache);
}

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
        
    if (cache.collection.state === CacheState.Uninitialized) refreshCourses(); // TODO: better check

    return {
        courses: cache.collection,
        createCourse,
        refreshCourses
    };
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