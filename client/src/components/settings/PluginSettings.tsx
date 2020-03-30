import * as React from "react";
import {Loading} from "../general/loading/Loading";
import {getPlugins, updatePlugin, createPlugin, deletePlugin} from "../../../helpers/APIHelper";
import {Plugin} from "../../../../models/api/Plugin";
import {useState, Fragment} from "react";
import {User} from "../../../../models/api/User";
import {WebhookEvent} from "../../../../models/enums/webhookEventEnum";
import {Block} from "../general/Block";
import {Button, Form, InputGroup} from "react-bootstrap";
import {Label} from "../general/Label";
import {Area} from "../general/Area";
import {CheckboxInput} from "../input/CheckboxInput";

export function PluginSettings() {
	const [creating, updateCreating] = useState(false);

	return (
		<Loading<Plugin[]>
			loader={() => getPlugins()}
			component={plugins =>
				<Fragment>
					{plugins.map(plugin => <PluginBox plugin={plugin}/>)}
					{creating
						? <CreatePlugin onCreated={() => updateCreating(false)} onDiscarded={() => updateCreating(false)}/>
						: <Button onClick={() => updateCreating(true)}>Add</Button>}
				</Fragment>
			}
		/>
	);
}

function PluginBox({plugin}: {plugin: Plugin}) {
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
		if (confirm(`This will delete plugin ${p.user.name} from Atelier and make it unavailable for use in any course. Are you sure you want to proceed?`)) {
			updateSaving(true);
			await deletePlugin(p.pluginID);
			updateSaving(false);
			// TODO: somehow update state
		}
	}

	return (
		<Block transparent className="mb-3 pl-2" key={p.pluginID}>
			<Form>
				<EditBox label="ID"
				         editing={false}
				         value={p.pluginID}/>
				<EditBox label="Name"
				         editing={editing}
				         value={p.user.name}
				         onChange={name => updateP(p => ({...p, user: {...p.user, name}}))}/>
				<EditBox label="Email"
				         editing={editing}
				         value={p.user.email}
				         onChange={email => updateP(p => ({...p, user: {...p.user, email}}))}/>
				<EditBox label="Webhook URL"
				         editing={editing}
				         value={p.webhookUrl}
				         onChange={webhookUrl => updateP(p => ({...p, webhookUrl}))}/>
				<EditBox label="Webhook Secret"
				         editing={editing}
				         value={p.webhookSecret}
				         onChange={webhookSecret => updateP(p => ({...p, webhookSecret}))}/>
				<EditTextarea label="Public Key"
				              editing={editing}
				              value={p.publicKey}
				              onChange={publicKey => updateP(p => ({...p, publicKey}))}/>
				{Object.values(WebhookEvent).map(event =>
					<Form.Label className="w-100">
						<CheckboxInput
							name={event}
							value={event}
							selected={p.hooks.includes(event)}
							disabled={!editing}
							onChange={(state) => {
								state ?
									updateP(p => ({...p, hooks: p.hooks.concat(event)}))
									:
									updateP(p => ({...p, hooks: p.hooks.filter(e => e !== event)}));
							}}
						/>
					</Form.Label>
				)}
				{editing ?
					<div>
						<Button disabled={saving} onClick={handleSave} className="mr-2">Save</Button>
						<Button disabled={saving} onClick={handleDiscard}>Discard</Button>
					</div>
					:
					<div>
						<Button onClick={() => updateEditing(true)} className="mr-2">Edit</Button>
						<Button onClick={handleDelete}>Delete</Button>
					</div>
				}
			</Form>
		</Block>
	);
}

interface EditBoxProperties {
	label: string,
	value: string,
	onChange?: (value: string) => void,
	editing?: boolean
}

function EditBox({label, value, onChange, editing = true}: EditBoxProperties) {
	return <Form.Label className="w-100">
		<Label>{label}</Label>
		<InputGroup>
			{editing ?
				<Form.Control
					type="text"
					placeholder="Course name"
					value={value}
					onChange={(event: React.FormEvent<HTMLInputElement>) => onChange && onChange((event.target as HTMLInputElement).value)}
				/>
				:
				<Form.Control plaintext readOnly value={value}/>
			}
		</InputGroup>
	</Form.Label>;
}

function EditTextarea({label, value, onChange, editing = true}: EditBoxProperties) {
	return <Form.Label className="w-100">
		<Label>{label}</Label>
		<InputGroup>
			<Form.Control as="textarea" readOnly={!editing} value={value} onChange={event => onChange && onChange((event.target as HTMLInputElement).value)}/>
		</InputGroup>
	</Form.Label>;
}

interface CreatePluginProperties {
	onCreated: (plugin: Plugin) => void;
	onDiscarded: () => void;
}

function CreatePlugin({onCreated, onDiscarded}: CreatePluginProperties) {
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
				user: {name, email} as User,
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
			<EditBox label="Name" value={name} onChange={updateName}/>
			<EditBox label="Email" value={email} onChange={updateEmail}/>
			<EditBox label="Webhook URL" value={webhookUrl} onChange={updateWebhookUrl}/>
			<EditBox label="Webhook Secret" value={webhookSecret} onChange={updateWebhookSecret}/>
			<EditTextarea label="Public Key" value={publicKey} onChange={updatePublicKey}/>
			{Object.values(WebhookEvent).map(event =>
				<Form.Label className="w-100">
					<CheckboxInput
						name={event}
						value={event}
						selected={hooks.includes(event)}
						onChange={(state) => {
							state ?
								updateHooks(hooks => hooks.concat(event))
								:
								updateHooks(hooks => hooks.filter(e => e !== event));
						}}
					/>
				</Form.Label>
			)}
			<div>
				<Button disabled={saving} type="submit" className="mr-2">Save</Button>
				<Button disabled={saving} type="reset">Discard</Button>
			</div>
		</form>
	);
}