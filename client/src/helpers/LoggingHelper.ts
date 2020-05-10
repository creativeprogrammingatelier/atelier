import pino from 'pino';
import { postLogs } from './api/APIHelper';

/** 
 * Identifier for this client, based on absolutely nothing. Used
 * to combine log events from a single client, without needing
 * to identify the user. It is stored in sessionStorage to have the
 * same ID in a session, but we don't really need to identify the
 * same client across sessions.
 */
export const getClientId = () => {
    const id = sessionStorage.getItem("client_id");
    if (id !== null) {
        return Number(id);
    } else {
        const id = Math.floor(Math.random() * Math.pow(10, 15));
        sessionStorage.setItem("client_id", id.toFixed(0));
        return id;
    }
}

export const logger = pino({
    browser: {
        write: event => {
            console.log(event);
            event["name"] = "Atelier-Client";
            event["hostname"] = "Client";
            event["pid"] = getClientId();
            postLogs([event]);
        }
    }
})
