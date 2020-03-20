import fetch, { Request } from 'node-fetch';
import crypto from 'crypto';
import { PluginsDB } from '../database/PluginsDB';
import { Plugin } from '../../../models/database/Plugin';

interface WebhookRequest<T> {
    event: string,
    payload: T
}

export function getSubscribedPlugins(courseID: string, event: string) {
    return PluginsDB.getRelevantPlugins(courseID, event);
}

export async function raiseWebhookEvent<T>(courseID: string, event: string, body: T) {
    const plugins = await getSubscribedPlugins(courseID, event);
    return Promise.all(plugins.map(plugin => postWebhook(plugin, event, body)));
}

export function createWebhookRequest<T>(plugin: Plugin, event: string, body: T) {
    const request: WebhookRequest<T> = {
        event,
        payload: body
    }
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

async function postWebhook<T>(plugin: Plugin, event: string, body: T) {
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