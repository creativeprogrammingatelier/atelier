import React, {useState, useEffect, Fragment} from "react";
import {permission} from "../../../helpers/APIHelper";
import {CourseRole} from "../../../../models/enums/CourseRoleEnum";
import {PermissionEnum, containsPermission} from "../../../../models/enums/PermissionEnum";
import {searchUsers} from "../../../helpers/APIHelper";
import {Tag} from "../general/Tag";
import { useObservableState } from "observable-hooks";
import { useCoursePermission, usePermission } from "../../helpers/api/APIHooks";
import { map } from "rxjs/operators";
import { Permission } from "../../../../models/api/Permission";
import { CacheItem } from "../../helpers/api/Cache";

interface MentionSuggestionsProperties {
	/** Prefix for display */
	prefix?: string
	/** Already inserted text to match with the start of suggestions */
	suggestionBase: string,
	round?: boolean,
	/** The ID of the course the comment is written for */
	courseID?: string,
	/** Callback that's called when a suggestion is selected */
	onSelected: (user: string) => void
}

export function MentionSuggestions({prefix, suggestionBase, round, courseID, onSelected}: MentionSuggestionsProperties) {
	const [suggestions, setSuggestions] = useState({options: [] as string[], base: suggestionBase});

	const displayPrefix: string = prefix === undefined ? "" : prefix;

	function filterSuggestions(suggestions: string[], base: string) {
		return suggestions.filter(user => user.toLowerCase().includes(base.toLowerCase()));
    }
    
    const permission = courseID ? useCoursePermission(courseID) : usePermission();
    const allowedGroups = useObservableState(permission.observable.pipe(
        map(permission => {
            const groups: string[] = [];
            const permissions = (permission as CacheItem<Permission>)?.value?.permissions;
            if (permissions) {
                if (containsPermission(PermissionEnum.mentionAllTeachers, permissions)) {
                    groups.push(CourseRole.teacher);
                }
                if (containsPermission(PermissionEnum.mentionAllAssistants, permissions)) {
                    groups.push(CourseRole.TA);
                }
                if (containsPermission(PermissionEnum.mentionAllStudents, permissions)) {
                    groups.push(CourseRole.student);
                }
            }
			return groups;
        })
    ), []);

    useEffect(() => {
        if (allowedGroups === []) permission.refresh();
    }, []);

	useEffect(() => {
		if (suggestionBase === null || suggestionBase.trim() === "") {
			setSuggestions({options: [], base: ""});
		} else {
			// Quick offline filter for relevant results
			setSuggestions(({options: users}) => ({options: filterSuggestions(users, suggestionBase), base: suggestionBase}));

			// Online lookup, only if there's a good chance we'll get results
			// Therefore the string for which we'll request suggestions has to be shorter than 25 characters
			// and we either had an empty base before, or if we had a similar base, there were some suggestions
			if ((suggestions.base === "" || !(suggestions.options.length === 0 && suggestionBase.includes(suggestions.base)))
				&& suggestionBase.length < 25) {
				const oldBase = suggestionBase;
				// TODO make a seperate api endpoint for mentions that includes 
				searchUsers(suggestionBase, courseID, 10).then(users => {
					const options = users.map(u => u.name).concat(allowedGroups)
					const filtered = filterSuggestions(options, suggestionBase);
					setSuggestions(({options: users, base}) => {
						// If the base is exactly the same, we're fine
						if (oldBase === base) {
							return {options:filtered, base};
							// If the base has grown, filter on what's still relevant
						} else if (base.includes(oldBase)) {
							return {options: filterSuggestions(filtered, base), base};
							// If the base is smaller or has changed, we don't want to use these results
						} else {
							return {options: users, base};
						}
					});
				});
			}
		}
	}, [suggestionBase]);

	return suggestions.options.length > 0 ?
		<ul className={"mentions m-0 w-100" + (round ? " px-2 pt-2 mb-2" : " px-1 pt-1 mb-1 ")}>
			{suggestions.options.map(user => <Tag key={user} large round theme="primary" click={() => onSelected(user)}>{displayPrefix}{user}</Tag>)}
		</ul>
		:
		<Fragment/>;
}