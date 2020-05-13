import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";

import {User} from "../../../../../models/api/User";

import {getCurrentUser, setUser} from "../../../helpers/api/APIHelper";

import {Loading} from "../../general/loading/Loading";
import {Label} from "../../general/Label";

export function UserSettingsGeneral() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	
	const handleNameChange = (name: string) => {
		setName(name);
	};
	const handleEmailChange = (email: string) => {
		setEmail(email);
	};
	const handleUpdate = () => {
		setUser({name, email}).then((user: User) => {
			setName(user.name);
			setEmail(user.email);
		});
	};
	
	return <Loading
		loader={() => getCurrentUser()}
		component={(user: User) => {
			if (name.length === 0) {
				setName(user.name);
			}
			if (email.length === 0) {
				setEmail(user.email);
			}
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