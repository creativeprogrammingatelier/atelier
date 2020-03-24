import React from 'react';
import {useState} from "react";
import {MentionSuggestions} from "../comment/MentionSuggestions";

interface UserSearchProps {
    courseID? : string,
    onSelected : (x : string) => void
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