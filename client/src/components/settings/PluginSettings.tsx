import * as React from 'react';
import { Loading } from '../general/loading/Loading';
import { getPlugins, updatePlugin, createPlugin, deletePlugin } from '../../../helpers/APIHelper';
import { Plugin } from '../../../../models/api/Plugin';
import { useState, Fragment } from 'react';
import { User } from '../../../../models/api/User';
import { WebhookEvent } from '../../../../models/enums/webhookEventEnum';

export function PluginSettings() {
    const [creating, updateCreating] = useState(false);

    return (
        <Loading<Plugin[]>
            loader={() => getPlugins()}
            component={plugins =>
                <Fragment>
                    {plugins.map(plugin => <PluginBox plugin={plugin} />)}
                    {creating
                     ? <CreatePlugin onCreated={() => updateCreating(false)} onDiscarded={() => updateCreating(false)} />
                     : <button onClick={() => updateCreating(true)}>Add</button>}
                </Fragment>
            } />
    );
}

function PluginBox({ plugin }: { plugin: Plugin }) {
    const [editing, updateEditing] = useState(false);
    const [saving, updateSaving] = useState(false);
    const [p, updateP] = useState(plugin);

    async function handleSave() {
        updateSaving(true);
        try {
            const updated = await updatePlugin(p);
            updateP(updated);
            updateEditing(false);
        } catch (err) {
            // TODO: handle error for the user
            console.log(err);
        } finally {
            updateSaving(false);
        }
    }

    function handleDiscard() {
        updateEditing(false);
        updateP(plugin);
    }

    async function handleDelete() {
        if(confirm(`This will delete plugin ${p.user.name} from Atelier and make it unavailable for use in any course. Are you sure you want to proceed?`)) {
            updateSaving(true);
            await deletePlugin(p.pluginID);
            updateSaving(false);
            // TODO: somehow update state
        }
    }

    return (
        <div key={p.pluginID}>
            <EditBox label="ID"
                editing={false}
                value={p.pluginID} />
            <EditBox label="Name" 
                editing={editing} 
                value={p.user.name} 
                onChange={name => updateP(p => ({ ...p, user: { ...p.user, name } }))} />
            <EditBox label="Email" 
                editing={editing} 
                value={p.user.email} 
                onChange={email => updateP(p => ({ ...p, user: { ...p.user, email } }))} />
            <EditBox label="Webhook URL" 
                editing={editing} 
                value={p.webhookUrl} 
                onChange={webhookUrl => updateP(p => ({ ...p, webhookUrl }))} />
            <EditBox label="Webhook Secret" 
                editing={editing} 
                value={p.webhookSecret} 
                onChange={webhookSecret => updateP(p => ({ ...p, webhookSecret }))} />
            <EditTextarea label="Public Key" 
                editing={editing} 
                value={p.publicKey} 
                onChange={publicKey => updateP(p => ({ ...p, publicKey }))} />
            {Object.values(WebhookEvent).map(event => 
                <Fragment>
                    <input type="checkbox" 
                        name={event} 
                        value={event} 
                        checked={p.hooks.includes(event)} 
                        disabled={!editing}
                        onChange={ev => 
                            ev.target.checked 
                            ? updateP(p => ({ ...p, hooks: p.hooks.concat(event) })) 
                            : updateP(p => ({ ...p, hooks: p.hooks.filter(e => e !== event) }))} />
                    <label>{event}</label>
                </Fragment>
            )}
            {editing
             ? <div>
                   <button disabled={saving} onClick={handleSave}>Save</button>
                   <button disabled={saving} onClick={handleDiscard}>Discard</button>
               </div>
             : <div>
                   <button onClick={() => updateEditing(true)}>Edit</button>
                   <button onClick={handleDelete}>Delete</button>
               </div>}
        </div>
    );
}

interface EditBoxProperties {
    label: string,
    value: string,
    onChange?: (value: string) => void,
    editing?: boolean
}

function EditBox({ label, value, onChange, editing = true }: EditBoxProperties) {
    if (editing) {
        return (
            <div>
                <label>{label}</label>
                <input type="text" value={value} onChange={event => onChange && onChange(event.target.value)} />
            </div>
        );
    } else {
        return (
            <div>{label}: {value}</div>
        );
    }
}

function EditTextarea({ label, value, onChange, editing = true }: EditBoxProperties) {
    return (
        <div>
            <label>{label}</label>
            <textarea readOnly={!editing} value={value} onChange={event => onChange && onChange(event.target.value)} />
        </div>
    );
}

interface CreatePluginProperties {
    onCreated: (plugin: Plugin) => void;
    onDiscarded: () => void;
}

function CreatePlugin({ onCreated, onDiscarded }: CreatePluginProperties) {
    const [saving, updateSaving] = useState(false);

    const [name, updateName] = useState("");
    const [email, updateEmail] = useState("");
    const [webhookUrl, updateWebhookUrl] = useState("");
    const [webhookSecret, updateWebhookSecret] = useState("");
    const [publicKey, updatePublicKey] = useState("");
    const [hooks, updateHooks] = useState([] as string[]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        try {
            updateSaving(true);
            const plugin = await createPlugin({
                user: { name, email } as User,
                webhookUrl, webhookSecret, publicKey, hooks
            });
            updateSaving(false);
            onCreated(plugin);
        } catch (err) {
            // TODO: handle error
            console.log(err);
        } finally {
            updateSaving(false);
        }
    }

    function handleReset(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onDiscarded();
    }

    return (
        <form onSubmit={handleSubmit} onReset={handleReset}>
            <EditBox label="Name" value={name} onChange={updateName} />
            <EditBox label="Email" value={email} onChange={updateEmail} />
            <EditBox label="Webhook URL" value={webhookUrl} onChange={updateWebhookUrl} />
            <EditBox label="Webhook Secret" value={webhookSecret} onChange={updateWebhookSecret} />
            <EditTextarea label="Public Key" value={publicKey} onChange={updatePublicKey} />
            {Object.values(WebhookEvent).map(event => 
                <Fragment>
                    <input type="checkbox" 
                        name={event} 
                        value={event} 
                        checked={hooks.includes(event)} 
                        onChange={ev => 
                            ev.target.checked 
                            ? updateHooks(hooks => hooks.concat(event)) 
                            : updateHooks(hooks => hooks.filter(e => e !== event))} />
                    <label>{event}</label>
                </Fragment>
            )}
            <div>
                <button disabled={saving} type="submit">Save</button>
                <button disabled={saving} type="reset">Discard</button>
            </div>
        </form>
    );
}