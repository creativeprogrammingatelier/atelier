import React, {useEffect, useState} from "react";
import {Button, Form} from "react-bootstrap";

import {Plugin} from "../../../../../models/api/Plugin";
import {User} from "../../../../../models/api/User";
import {WebhookEvent} from "../../../../../models/enums/WebhookEventEnum";

import {createPlugin, deletePlugin, updatePlugin} from "../../../helpers/api/APIHelper";

import {FeedbackError} from "../../feedback/FeedbackError";
import {FeedbackContent} from "../../feedback/Feedback";
import {FeedbackSuccess} from "../../feedback/FeedbackSuccess";
import {MaybeInput} from "../../input/maybe/MaybeInput";
import {MaybeTextarea} from "../../input/maybe/MaybeTextarea";
import {CheckboxInput} from "../../input/CheckboxInput";
import {LabeledInput} from "../../input/LabeledInput";

interface PluginInputProperties {
    plugin?: Plugin,
    newPlugin?: {
        create: (plugin: Plugin) => void,
        cancel: () => void
    }
}

export function PluginInput({plugin, newPlugin}: PluginInputProperties) {
    const [editing, setEditing] = useState(newPlugin !== undefined);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false as FeedbackContent);
    const [error, setError] = useState(false as FeedbackContent);

    const [pluginID, setPluginID] = useState("");
    const [pluginName, setPluginName] = useState("");
    const [pluginEmail, setPluginEmail] = useState("");
    const [webhookUrl, setWebhookUrl] = useState("");
    const [webhookSecret, setWebhookSecret] = useState("");
    const [publicKey, setPublicKey] = useState("");
    const [hooks, setHooks] = useState([] as string[]);

    function setInput(plugin: Plugin) {
        setPluginID(plugin.pluginID);
        setPluginName(plugin.user.name);
        setPluginEmail(plugin.user.email);
        setWebhookUrl(plugin.webhookUrl);
        setWebhookSecret(plugin.webhookSecret);
        setPublicKey(plugin.publicKey);
        setHooks(plugin.hooks);
    }

    function resetInput() {
        setPluginID("");
        setPluginName("");
        setPluginEmail("");
        setWebhookUrl("");
        setWebhookSecret("");
        setPublicKey("");
        setHooks([]);
    }

    async function handleCreate() {
        if (newPlugin) {
            setSaving(true);
            try {
                const plugin = await createPlugin({
                    webhookUrl,
                    webhookSecret,
                    publicKey,
                    hooks,
                    user: {
                        name: pluginName,
                        email: pluginEmail
                    } as User
                });
                newPlugin.create(plugin);
                setSuccess(`Added new plugin ${plugin.user.name}`);
            } catch (error) {
                setError(`Failed to add plugin: ${error}`);
            } finally {
                setSaving(false);
            }
        }
    }

    async function handleSave() {
        if (plugin) {
            setSaving(true);
            try {
                const updated = await updatePlugin({
                    pluginID,
                    webhookUrl,
                    webhookSecret,
                    publicKey,
                    hooks,
                    user: {
                        ...plugin.user,
                        name: pluginName,
                        email: pluginEmail
                    }
                });
                setInput(updated);
                setEditing(false);
                setSuccess(`Updated plugin`);
            } catch (error) {
                setError(`Could not save changed: ${error}`);
            } finally {
                setSaving(false);
            }
        }
    }

    function handleCancel() {
        if (newPlugin) {
            resetInput();
            newPlugin.cancel();
        }
    }

    function handleDiscard() {
        setEditing(false);
        resetInput();
    }

    async function handleDelete() {
        if (confirm(`This will delete plugin ${pluginName} from Atelier and make it unavailable for use in any course. Are you sure you want to proceed?`)) {
            setSaving(true);
            await deletePlugin(pluginID);
            setSaving(false);
            // TODO: somehow update state
            // Probably can be done once the fancy new useCache is there
        }
    }

    useEffect(() => {
        if (plugin) {
            setInput(plugin);
        } else {
            resetInput();
        }
    }, [plugin]);

    return <Form>
        {
            !newPlugin &&
            <LabeledInput label="ID">
                <MaybeInput modify={false} placeholder="Plugin ID" value={pluginID}/>
            </LabeledInput>
        }
        <LabeledInput label="Name">
            <MaybeInput modify={editing} placeholder="Plugin name" value={pluginName} onChange={setPluginName}/>
        </LabeledInput>
        <LabeledInput label="Email">
            <MaybeInput modify={editing} placeholder="Contact email" value={pluginEmail} onChange={setPluginEmail}/>
        </LabeledInput>
        <LabeledInput label="Webhook URL">
            <MaybeInput modify={editing} placeholder="Webhook URL" value={webhookUrl} onChange={setWebhookUrl}/>
        </LabeledInput>
        <LabeledInput label="Webhook secret">
            <MaybeInput modify={editing} placeholder="Webhook secret" value={webhookSecret}
                        onChange={setWebhookSecret}/>
        </LabeledInput>
        <LabeledInput label="Public key">
            <MaybeTextarea modify={editing} placeholder="Plugin public key" value={publicKey} onChange={setPublicKey}/>
        </LabeledInput>
        <LabeledInput label="Used webhooks">
            {Object.values(WebhookEvent).map(event =>
                <CheckboxInput
                    name={event}
                    key={event}
                    value={event}
                    selected={hooks.includes(event)}
                    disabled={!editing}
                    onChange={(state) => {
                        state ?
                            setHooks(hooks => hooks.concat(event))
                            :
                            setHooks(hooks => hooks.filter(hook => hook !== event));
                    }}
                />
            )}
        </LabeledInput>
        {editing ?
            <div>
                <Button disabled={saving} onClick={newPlugin ? handleCreate : handleSave}
                        className="mr-2">{newPlugin ? "Create" : "Save"}</Button>
                <Button disabled={saving}
                        onClick={newPlugin ? handleCancel : handleDiscard}>{newPlugin ? "Cancel" : "Discard"}</Button>
            </div>
            :
            <div>
                <Button onClick={() => setEditing(true)} className="mr-2">Edit</Button>
                <Button onClick={handleDelete}>Delete</Button>
            </div>
        }
        <FeedbackSuccess close={setSuccess}>{success}</FeedbackSuccess>
        <FeedbackError close={setError}>{error}</FeedbackError>
    </Form>;
}