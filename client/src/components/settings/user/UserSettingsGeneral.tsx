import * as React from "react";
import {Loading} from "../../general/loading/Loading";
import {getCurrentUser, setUser} from "../../../../helpers/APIHelper";
import {User} from "../../../../../models/api/User";
import {useState} from "react";
import {Button, Form} from "react-bootstrap";
import {Label} from "../../general/Label";

export function UserSettingsGeneral() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [reload, setReload] = useState(false);

	const handleNameChange = (name: string) => {
		setName(name);
		setReload(true);
	};
	const handleEmailChange = (email: string) => {
		setEmail(email);
		setReload(true);
	};
	const handleUpdate = () => {
		setUser({name, email}).then(() => setReload(true));
	};
	return <Loading
		loader={reload => getCurrentUser(false)}
		params={[reload]}
		component={(user: User) => {
			if (name.length === 0) {
				setName(user.name);
			}
			if (email.length === 0) {
				setEmail(user.email);
			}
			setReload(false);
			return <Form>
				<Form.Label className="w-100">
					<Label>Name</Label>
					<Form.Control
						type="text"
						placeholder="Your name"
						value={name}
						onChange={(event: React.FormEvent<HTMLInputElement>) => handleNameChange((event.target as HTMLInputElement).value)}
					/>
				</Form.Label>
				<Form.Label className="w-100">
					<Label>Email</Label>
					<Form.Control
						type="text"
						placeholder="Your email"
						value={email}
						onChange={(event: React.FormEvent<HTMLInputElement>) => handleEmailChange((event.target as HTMLInputElement).value)}
					/>
				</Form.Label>
				<Button onClick={handleUpdate}>Update</Button>
			</Form>;
		}}
	/>;
}