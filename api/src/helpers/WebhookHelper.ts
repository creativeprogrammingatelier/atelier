import { PluginConfiguration, config } from './ConfigurationHelper';
import crypto from 'crypto';

interface WebhookRequest<T> {
    event: string,
    payload: T
}

export function raiseWebhookEvent<T>(event: string, body: T) {
    return Promise.all(
        config.plugins
            .filter(plugin => plugin.hooks.includes(event))
            .map(plugin => postWebhook(plugin, event, body))
    );
}

async function postWebhook<T>(plugin: PluginConfiguration, event: string, body: T) {
    const request: WebhookRequest<T> = {
        event,
        payload: body
    }
    const payload = JSON.stringify(request);
    const signature = crypto.createHmac('sha1', plugin.webhookSecret).update(payload).digest('base64');
    const res = await fetch(plugin.webhookUrl, {
        body: payload,
        headers: { 
            "Content-Type": "application/json",
            "User-Agent": "Atelier",
            "X-Atelier-Signature": signature
        }
    });
    if (!res.ok) {
        // TODO: store this somewhere the plugin owner can see it
        console.log(`Error while posting webhook request. Recipient: ${plugin} Event: ${event}`);
    }
}