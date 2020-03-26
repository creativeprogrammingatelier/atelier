import React, {useState, useEffect, Fragment} from "react";
import {permission} from "../../../helpers/APIHelper";
import {courseRole} from "../../../../models/enums/courseRoleEnum";
import {PermissionEnum, containsPermission} from "../../../../models/enums/permissionEnum";
import {User} from "../../../../models/api/User";
import {searchUsers} from "../../../helpers/APIHelper";
import {Tag} from "../general/Tag";

interface MentionSuggestionsProperties {
	/** Prefix for display */
	prefix?: string
	/** Already inserted text to match with the start of suggestions */
	suggestionBase: string,
	round?: boolean,
	/** The ID of the course the comment is written for */
	courseID?: string,
	/** Callback that's called when a suggestion is selected */
	onSelected: (user: User) => void
}

export function MentionSuggestions({prefix, suggestionBase, round, courseID, onSelected}: MentionSuggestionsProperties) {
	const [allowedGroups, updateAllowedGroups] = useState([] as courseRole[]);
	const [suggestions, updateSuggestions] = useState({users: [] as User[], base: suggestionBase});

	const displayPrefix: string = prefix === undefined ? "" : prefix;

	function filterSuggestions(suggestions: User[], base: string) {
		return suggestions.filter(s => s.name.toLowerCase().includes(base.toLowerCase()));
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
			updateSuggestions({users: [], base: ""});
		} else {
			// Quick offline filter for relevant results
			updateSuggestions(({users}) => ({users: filterSuggestions(users, suggestionBase), base: suggestionBase}));

            // Online lookup, only if there's a good chance we'll get results
            // Therefore the string for which we'll request suggestions has to be shorter than 25 characters
            // and we either had an empty base before, or if we had a similar base, there were some suggestions
            if ((suggestions.base === "" || !(suggestions.s.length === 0 && suggestionBase.includes(suggestions.base)))
                && suggestionBase.length < 25) {
                const oldBase = suggestionBase;
                searchUsers(suggestionBase, courseID, 10).then(users => {
                    //const names = users.map(u => u.name);
                    updateSuggestions(({ s, base }) => {
                        // Create the group suggestions
                        // TODO: This is a terrible, terrible hack and it's all Jarik's fault :)
                        const groups = filterSuggestions(allowedGroups.map(g => ({ name: g } as User)), base);

						// If the base is exactly the same, we're fine
						if (oldBase === base) {
							return {users: users.concat(groups), base};
							// If the base has grown, filter on what's still relevant
						} else if (base.includes(oldBase)) {
							return {users: filterSuggestions(users, base).concat(groups), base};
							// If the base is smaller or has changed, we don't want to use these results
						} else {
							return {users, base};
						}
					});
				});
			}
		}
	}, [suggestionBase]);

	function Suggestion({user}: {user: User}) {
		return <Tag large round theme="primary">{displayPrefix}{user.name}</Tag>;
	}

	return suggestions.users.length > 0 ?
		<ul className={"mentions m-0 w-100" + (round ? " px-2 pt-2 mb-2" : " px-1 pt-1 mb-1 ")}>
			{suggestions.users.map(user => <Tag large round theme="primary">{displayPrefix}{user.name}</Tag>)}
		</ul>
		:
		<Fragment/>;
}