import React, {useState, useEffect} from "react";
import { searchUsersInCourse, permission } from "../../../helpers/APIHelper";
import { courseRole } from "../../../../models/enums/courseRoleEnum";
import { PermissionEnum, containsPermission } from "../../../../models/enums/permissionEnum";

interface MentionSuggestionsProperties {
	/** Already inserted text to match with the start of suggestions */
    suggestionBase: string,
    /** The ID of the course the comment is written for */
    courseID: string,
	/** Callback that's called when a suggestion is selected */
	onSelected: (name: string) => void
}

export function MentionSuggestions({suggestionBase, courseID, onSelected}: MentionSuggestionsProperties) {
    const [allowedGroups, updateAllowedGroups] = useState([] as courseRole[]);
	const [suggestions, updateSuggestions] = useState({ s: [] as string[], base: suggestionBase });

    function filterSuggestions(suggestions: string[], base: string) {
        return suggestions.filter(s => s.toLowerCase().includes(base.toLowerCase()));
    }

    useEffect(() => {
        permission().then(permission => {
            const groups = [];
            if (containsPermission(PermissionEnum.mentionAllTeachers, permission.permissions)) {
                groups.push(courseRole.teacher);
            }
            if (containsPermission(PermissionEnum.mentionAllAssistants, permission.permissions)) {
                groups.push(courseRole.TA);
            }
            if (containsPermission(PermissionEnum.mentionAllStudents, permission.permissions)) {
                groups.push(courseRole.student);
            }
            console.log("Allowed groups to mention: ", groups);
            updateAllowedGroups(groups);
        });
    }, []);

	useEffect(() => {
		if (suggestionBase === null || suggestionBase.trim() === "") {
			updateSuggestions({ s: [], base: "" });
		} else {
            // Quick offline filter for relevant results
            updateSuggestions(({ s }) => ({ s: filterSuggestions(s, suggestionBase), base: suggestionBase }));

            // Online lookup, only if there's a good chance we'll get results
            // Therefore the string for which we'll request suggestions has to be shorter than 25 characters
            // and we either had an empty base before, or if we had a similar base, there were some suggestions
            if ((suggestions.base === "" || !(suggestions.s.length === 0 && suggestionBase.includes(suggestions.base)))
                && suggestionBase.length < 25) {
                const oldBase = suggestionBase;
                searchUsersInCourse(suggestionBase, courseID, 10).then(users => {
                    const names = users.map(u => u.name);
                    updateSuggestions(({ s, base }) => {
                        // Create the group suggestions
                        const groups = filterSuggestions(allowedGroups, base);

                        // If the base is exactly the same, we're fine
                        if (oldBase === base) {
                            return { s: names.concat(groups), base };
                        // If the base has grown, filter on what's still relevant
                        } else if (base.includes(oldBase)) {
                            return { s: filterSuggestions(names, base).concat(groups), base };
                        // If the base is smaller or has changed, we don't want to use these results
                        } else {
                            return { s, base };
                        }
                    });
                });
            }
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
            {suggestions.s.map(s => <Suggestion text={s}/>)}
        </ul>
    );
}