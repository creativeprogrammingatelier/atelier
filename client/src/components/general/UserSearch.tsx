import React, {useEffect} from "react";
import {useState} from "react";
import {MentionSuggestions} from "../comment/MentionSuggestions";
import {User} from "../../../../models/api/User";
import {Button, Form} from "react-bootstrap";
import {Label} from "./Label";
import {courseState} from "../../../../models/enums/courseStateEnum";
import {Tag} from "./Tag";
import {searchUsers} from "../../../helpers/APIHelper";

interface UserSearchProps {
	courseID? : string,
	onSelected : (x : User) => void
}

export function UserSearch({courseID, onSelected} : UserSearchProps) {
	const [search, setSearch] = useState("");
	const [users, setUsers] = useState([] as User[]);
	const [user, setUser] = useState(undefined as User | undefined);

	const handleSelected = (user: User) => {
		setUser(user);
		setUsers([]);
		setSearch(user.name);
		onSelected(user);
	};

	useEffect(() => {
		if (!(user && user.name === search)) {
			searchUsers(search, undefined, 10).then(setUsers);
		}
	}, [search]);

	return <Form>
		<Form.Label className="w-100">
			<Label>Search for a user</Label>
			<Form.Control
				type="text"
				placeholder="Course name"
				value={search}
				onChange={(event: React.FormEvent<HTMLInputElement>) => setSearch((event.target as HTMLInputElement).value)}
			/>
			{
				users.length > 0 &&
				<ul className="mentions m-0 w-100 px-1 pt-1 mb-1">
					{users.map(user => <Tag large round theme="primary" click={() => handleSelected(user)}>{user.name}</Tag>)}
				</ul>
			}
		</Form.Label>
	</Form>;
}