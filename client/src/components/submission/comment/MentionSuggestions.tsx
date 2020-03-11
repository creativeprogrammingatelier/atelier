import React, {useState, useEffect} from "react";
import { searchUsersInCourse } from "../../../../helpers/APIHelper";

interface MentionSuggestionsProperties {
	/** Already inserted text to match with the start of suggestions */
    suggestionBase: string,
    /** The ID of the course the comment is written for */
    courseID: string,
	/** Callback that's called when a suggestion is selected */
	onSelected: (name: string) => void
}

export function MentionSuggestions({suggestionBase, courseID, onSelected}: MentionSuggestionsProperties) {
	const [suggestions, updateSuggestions] = useState([] as string[]);

	useEffect(() => {
		if (suggestionBase === null || suggestionBase === "") {
			updateSuggestions([]);
		} else {
			searchUsersInCourse(suggestionBase, courseID, 10).then(users => {
                updateSuggestions(users.map(u => u.name));
            });
		}
	}, [suggestionBase]);

	function Suggestion({text}: {text: string}) {
		return (
			<li onClick={() => onSelected(text)} className="mention">
				@{text}
			</li>
		);
    }

    return (
        <ul className="m-0 px-1 pb-1">
            {suggestions.map(s => <Suggestion text={s}/>)}
        </ul>
    );
}