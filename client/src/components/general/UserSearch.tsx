import React from 'react';
import {useState} from "react";
import {MentionSuggestions} from "../comment/MentionSuggestions";
import {User} from "../../../../models/api/User";

interface UserSearchProps {
    courseID? : string,
    onSelected : (x : User) => void
}

export function UserSearch({courseID, onSelected} : UserSearchProps) {
    const [search, setSearch] = useState("");

    return (
        <div>
            <input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <MentionSuggestions
                suggestionBase={search}
                courseID={courseID}
                onSelected={onSelected}
            />
        </div>
    )
}