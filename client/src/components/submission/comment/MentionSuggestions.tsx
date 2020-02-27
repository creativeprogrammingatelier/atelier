import React, {useState, useEffect} from "react";

interface MentionSuggestionsProperties {
	/** Already inserted text to match with the start of suggestions */
	suggestionBase: string,
	/** Callback that's called when a suggestion is selected */
	onSelected: (name: string) => void
}

export function MentionSuggestions({suggestionBase, onSelected}: MentionSuggestionsProperties) {
	const [loading, updateLoading] = useState(false);
	const [suggestions, updateSuggestions] = useState([] as string[]);

	useEffect(() => {
		if (suggestionBase === null || suggestionBase === "") {
			updateSuggestions([]);
		} else {
			updateLoading(true);
			const suggestions = [
				"Pietje Puk",
				"Pieter Post",
				"Peter Tester",
				"Piet Peterszoon van den Hartogh"
			].filter(n => n.toLowerCase().startsWith(suggestionBase.toLowerCase()));
			updateSuggestions(suggestions);
			updateLoading(false);
		}
	}, [suggestionBase]);

	function Suggestion({text}: {text: string}) {
		return (
			<li onClick={() => onSelected(text)} className="mention">
				@{text}
			</li>
		);
	}

	if (loading) {
		return (
			<span>Loading...</span>
		);
	} else {
		return <ul className="m-0 px-1 pb-1">
				{suggestions.map(s => <Suggestion text={s}/>)}
			</ul>
	}
}