import React, { useContext, createContext, useState, useEffect } from 'react';
import { Cache, getCacheInterface, Update, CacheState, CacheInterface } from './Cache';
import { Course } from '../../../../models/api/Course';
import * as API from '../../../helpers/APIHelper';
import { courseState } from '../../../../models/enums/courseStateEnum';
import { randomBytes } from 'crypto';
import { User } from '../../../../models/api/User';
import { Permission } from '../../../../models/api/Permission';
import { globalRole } from '../../../../models/enums/globalRoleEnum';

interface Message {
    readonly type: "Information" | "Warning" | "Error",
    readonly message: string
}

interface API {
    readonly cache: Cache,
    readonly messages: Array<Message & { ID: string }>
}

interface APIContext {
    readonly api: API,
    readonly updateAPI: Update<API>
}

const apiContext = createContext<APIContext>({ api: { cache: {}, messages: [] }, updateAPI: f => {} })

export function APIProvider({ children }: { children: React.ReactNode }) {
    const cache = JSON.parse(localStorage.getItem("cache") || "{}");
    const [api, updateAPI] = useState<API>({ cache, messages: [] });

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

interface MessagesInterface {
    messages: Message[],
    addMessage: (message: Message) => string,
    removeMessage: (ID: string) => void
}

export function useMessages(): MessagesInterface {
    const { api, updateAPI } = useContext(apiContext);
    const removeMessage = (ID: string) => {
        updateAPI(api => ({
            ...api,
            messages: api.messages.filter(mes => mes.ID !== ID)
        }));
    }
    const addMessage = (message: Message) => {
        const id = randomBytes(32).toString('hex');
        console.log(message.type, "-", message.message);
        updateAPI(api => ({
            ...api,
            messages: api.messages.concat({ ...message, ID: id })
        }));
        setTimeout(() => removeMessage(id), 3000);
        return id;
    }
    return { messages: api.messages, addMessage, removeMessage }
}

function refresh<T>(promise: Promise<T[]>, cache: CacheInterface<T>, messages: MessagesInterface) {
    cache.setCollectionState("Loading");
    promise
        .then(result => cache.replaceAll(result, "Loaded"))
        .catch((err: Error) => {
            messages.addMessage({ type: "Error", message: err.message })
        });
}

function create<T extends { ID: string }>(promise: Promise<T>, item: T, cache: CacheInterface<T>, messages: MessagesInterface) {
    const tempID = randomBytes(32).toString('hex');
    console.log("Creating", tempID);
    cache.add({ ...item, ID: tempID }, "Loading");
    promise
        .then(result => {
            console.log("Creation of", tempID, "succeeded:", result);
            cache.replace(old => old.ID === tempID, result, "Loaded");
        })
        .catch((err: Error) => {
            messages.addMessage({ type: "Error", message: err.message }),
            cache.remove(item => item.ID === tempID);
        });
}

export function useCourses() {
    const cache = useCache<Course>("courses");
    const messages = useMessages();

    const refreshCourses = () => refresh(API.getCourses(), cache, messages);
    const createCourse = ({ name, state }: { name: string, state: courseState }) => 
        create(
            API.createCourse({ name, state }), 
            { ID: "", name, state, creator: {} as User, currentUserPermission: {} as Permission }, 
            cache, 
            messages
        );
        
    if (cache.collection.state === "Uninitialized") refreshCourses(); // TODO: better check

    return {
        courses: cache.collection,
        createCourse,
        refreshCourses
    };
}

export function usePermission() {
    const cache = useCache<Permission>("currentUserPermission");
    const messages = useMessages();

    const refreshPermission = () => refresh(API.permission().then(p => [p]), cache, messages);

    if (cache.collection.state === "Uninitialized") refreshPermission();

    return {
        permission: cache.collection.items[0] || { item: { permissions: 0, globalRole: globalRole.unregistered }, state: cache.collection.state },
        refreshPermission
    }
}