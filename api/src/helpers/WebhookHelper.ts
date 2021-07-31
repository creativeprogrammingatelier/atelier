import crypto from "crypto";
import fetch, {Request} from "node-fetch";

import {Plugin} from "../../../models/database/Plugin";
import {WebhookEvent} from "../../../models/enums/WebhookEventEnum";

import {PluginsDB} from "../database/PluginsDB";

interface WebhookRequest<T> {
	event: WebhookEvent,
	payload: T
}

/**
 * Get all the plugins in a course that are subscribed to the event. You
 * most likely don't need to call this, use `raiseWebhookEvent` instead.
 */
export function getSubscribedPlugins(courseID: string, event: WebhookEvent) {
    return PluginsDB.getRelevantPlugins(courseID, event);
}

/**
 * Raise a webhook event on a course with a certain payload. This will fetch
 * all subscribed plugins from the database and post the webhook requests to
 * the plugin URL.
 */
export async function raiseWebhookEvent<T>(courseID: string, event: WebhookEvent, body: T) {
    const plugins = await getSubscribedPlugins(courseID, event);
    return Promise.all(plugins.map(plugin => postWebhook(plugin, event, body)));
}

/**
 * Create the request that can be sent to a plugin. You most likely don't
 * need to call this, use `raiseWebhookEvent` instead.
 */
export function createWebhookRequest<T>(plugin: Plugin, event: WebhookEvent, body: T) {
    const request: WebhookRequest<T> = {
        event,
        payload: body
    };
    const payload = JSON.stringify(request);
    const signature = crypto.createHmac("sha1", plugin.webhookSecret).update(payload).digest("base64");
    return new Request(plugin.webhookUrl, {
        method: "POST",
        body: payload,
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Atelier",
            "X-Atelier-Signature": signature
        }
    });
}

/** Post a webhook event to the plugin */
async function postWebhook<T>(plugin: Plugin, event: WebhookEvent, body: T) {
    try {
        const res = await fetch(createWebhookRequest(plugin, event, body));
        if (!res.ok) {
            // TODO: store this somewhere the plugin owner can see it
            const resText = await res.text();
            console.log(`Error while posting event '${event}' to ${plugin.webhookUrl} (ID: ${plugin.pluginID}).
            Got response ${res.status}: ${resText}`);
        }
    } catch (err) {
        console.log(`Error while posting event '${event}' to ${plugin.webhookUrl} (ID: ${plugin.pluginID}).
        Caught error: `, err);
    }
}