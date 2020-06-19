import React, {useState, useEffect, Fragment} from "react";

import {getMostPopularTags} from "../../helpers/api/APIHelper";

import {Tag} from "../general/Tag";

interface TagSuggestionsProperties {
	/** Prefix for display */
	prefix?: string,
	tagIndex?: number,
	round?: boolean,
	/** Callback that's called when a suggestion is selected */
	onSelected: (tag: string) => void
}

export function TagSuggestions({prefix, tagIndex, round, onSelected}: TagSuggestionsProperties) {
	const [suggestions, setSuggestions] = useState( [] as string[]);
	const displayPrefix: string = prefix === undefined ? "" : prefix;

	useEffect(() => {
		getMostPopularTags(10, "").then(tags => {
			const options = tags.map(u => u.tagBody);
			setSuggestions(options);
		});
	}, [tagIndex]);

	return tagIndex != undefined ?
		<ul className={"mentions m-0 w-100" + (round ? " px-2 pt-2 mb-2" : " px-1 pt-1 mb-1 ")}>
			{suggestions.map(tag => <Tag key={tag} large round theme="primary" click={() => onSelected(tag)}>{displayPrefix}{tag}</Tag>)}
		</ul>
		:
		<Fragment/>;
}