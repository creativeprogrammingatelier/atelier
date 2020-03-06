import { PluginConfiguration, config } from './ConfigurationHelper';
import fetch, { Request } from 'node-fetch';
import crypto from 'crypto';

interface WebhookRequest<T> {
    event: string,
    payload: T
}

export function getSubscribedPlugins(event: string) {
    return config.plugins
        .filter(plugin => plugin.hooks.includes(event));
}

export function raiseWebhookEvent<T>(event: string, body: T) {
    return Promise.all(
        getSubscribedPlugins(event).map(plugin => postWebhook(plugin, event, body))
    );
}

export function createWebhookRequest<T>(plugin: PluginConfiguration, event: string, body: T) {
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

async function postWebhook<T>(plugin: PluginConfiguration, event: string, body: T) {
    const res = await fetch(createWebhookRequest(plugin, event, body));
    if (!res.ok) {
        // TODO: store this somewhere the plugin owner can see it
        console.log(`Error while posting webhook request. Recipient: ${plugin} Event: ${event}`);
    }
}