import React, {useEffect, useState} from "react";
import {Form} from "react-bootstrap";
import {User} from "../../../../../models/api/User";
import {searchUsers} from "../../../helpers/api/APIHelper";
import {Tag} from "../../general/Tag";
import {LabeledInput} from "../../input/LabeledInput";

interface UserSearchProperties {
    /** Course ID within the database */
    courseID?: string,
    /** Function to resolve a selection event. */
    onSelected: (user: User | undefined) => void
}
/**
 * Component to search a user within a given course.
 */
export function UserSearch({courseID, onSelected}: UserSearchProperties) {
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
        if (search.length > 0 && !(user && user.name === search)) {
            onSelected(undefined);
            searchUsers(search, courseID, 10).then(setUsers);
        }
    }, [search]);

    return <LabeledInput label="Search for a user">
        <Form.Control
            type="text"
            placeholder="Name"
            value={search}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch((event.target as HTMLInputElement).value)}
        />
        {
            users.length > 0 &&
            <ul className="mentions m-0 w-100 px-1 pt-1 mb-1">
                {users.map(user =>
                    <Tag
                        key={user.ID}
                        large
                        round
                        theme="primary"
                        click={() => handleSelected(user)}
                    >
                        {user.name}
                    </Tag>
                )}
            </ul>
        }
    </LabeledInput>;
}
