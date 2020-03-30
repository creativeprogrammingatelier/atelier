import {Plugin} from "../../../../../models/api/Plugin";
import {default as React, useEffect, useState} from "react";
import {createPlugin, deletePlugin, updatePlugin} from "../../../../helpers/APIHelper";
import {Button, Form} from "react-bootstrap";
import {LabeledInput} from "../../input/LabeledInput";
import {MaybeInput} from "../../input/maybe/MaybeInput";
import {WebhookEvent} from "../../../../../models/enums/webhookEventEnum";
import {CheckboxInput} from "../../input/CheckboxInput";
import {MaybeTextarea} from "../../input/maybe/MaybeTextarea";
import {User} from "../../../../../models/api/User";

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

	const [pluginID, setPluginID] = useState("");
	const [pluginName, setPluginName] = useState("");
	const [pluginEmail, setPluginEmail] = useState("");
	const [webhookUrl, setWebhookUrl] = useState("");
	const [webhookSecret, setWebhookSecret] = useState("");
	const [publicKey, setPublicKey] = useState("");
	const [hooks, setHooks] = useState([] as string[]);

	console.log("Rendering a plugin input");
	console.log(plugin);
	console.log(newPlugin);
	console.log(newPlugin !== undefined);
	console.log(editing);

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
			} catch (error) {
				// TODO: handle error for the user
				console.log(error);
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
					user: {
						...plugin.user,
						name: pluginName,
						email: pluginEmail
					}
				});
				setInput(updated);
				setEditing(false);
			} catch (error) {
				// TODO: handle error for the user
				console.log(error);
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
			<MaybeInput modify={editing} placeholder="Webhook secret" value={webhookSecret} onChange={setWebhookSecret}/>
		</LabeledInput>
		<LabeledInput label="Public key">
			<MaybeTextarea modify={editing} placeholder="Plugin public key" value={publicKey} onChange={setPublicKey}/>
		</LabeledInput>
		{Object.values(WebhookEvent).map(event =>
			<Form.Label className="w-100">
				<CheckboxInput
					name={event}
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
			</Form.Label>
		)}
		{editing ?
			<div>
				<Button disabled={saving} onClick={newPlugin ? handleCreate : handleSave} className="mr-2">{newPlugin ? "Create" : "Save"}</Button>
				<Button disabled={saving} onClick={newPlugin ? handleCancel : handleDiscard}>{newPlugin ? "Cancel" : "Discard"}</Button>
			</div>
			:
			<div>
				<Button onClick={() => setEditing(true)} className="mr-2">Edit</Button>
				<Button onClick={handleDelete}>Delete</Button>
			</div>
		}
	</Form>;
}