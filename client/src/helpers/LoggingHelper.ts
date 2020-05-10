import pino from 'pino';
import {postLogs} from './api/APIHelper';

const MAX_LOG_CACHE_SIZE = 100;
const LOG_CACHE_TIMEOUT = 5 * 60 * 1000;

const CLIENT_ID = "client_id";
const LOG_CACHE = "logs";

/** 
 * Identifier for this client, based on absolutely nothing. Used
 * to combine log events from a single client, without needing
 * to identify the user. It is stored in sessionStorage to have the
 * same ID in a session, but we don't really need to identify the
 * same client across sessions.
 */
export function getClientId() {
    const id = sessionStorage.getItem(CLIENT_ID);
    if (id !== null) {
        return Number(id);
    } else {
        const id = Math.floor(Math.random() * Math.pow(10, 15));
        sessionStorage.setItem(CLIENT_ID, id.toFixed(0));
        return id;
    }
}

/** Global instance of our logger */
export const logger = pino({
    browser: {
        write: event => {
            console.log(event);
            queueLogEvent(event);
        }
    }
});

const readLogCache = () => JSON.parse(localStorage.getItem(LOG_CACHE) || "[]") as object[];
const writeLogCache = (logs: object[]) => localStorage.setItem(LOG_CACHE, JSON.stringify(logs));

/** Queue a log event to be sent to the server in the future */
function queueLogEvent(event: object) {
    const cache = readLogCache();
    const count = cache.push(event);
    writeLogCache(cache);
    if (count >= MAX_LOG_CACHE_SIZE) {
        flushLogCache();
    }
}

// This is in the browser, so it is actually a number, not a NodeJS.Timeout,
// but since we have the NodeJS types installed, TypeScript gets confused.
// It should not cause any problems, as long as it is only used as a handle.
let cacheFlushTimeout = setTimeout(flushLogCache, LOG_CACHE_TIMEOUT);

/** Send all events in the log cache to the server */
async function flushLogCache() {
    clearTimeout(cacheFlushTimeout);
    
    const logs = readLogCache();
    if (logs.length > 0) {
        writeLogCache([]);

        try {
            await postLogs(
                logs.map(event => ({
                    ...event,
                    name: "Atelier-Client",
                    hostname: "Client",
                    pid: getClientId()
                })));
        } catch (e) {
            // If sending fails, we want to try again next time with all our old events
            const newCache = readLogCache();
            writeLogCache(logs.concat(newCache));
        }
    }

    cacheFlushTimeout = setTimeout(flushLogCache, LOG_CACHE_TIMEOUT);
}