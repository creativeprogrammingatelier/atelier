import React, {useState} from 'react';
import {User} from "../../../../models/api/User";
import {MentionSuggestions} from "../comment/MentionSuggestions";
import {UserSearch} from "../general/UserSearch";
import {courseEnrollUser} from "../../../helpers/APIHelper";
import {CourseUser} from "../../../../models/api/CourseUser";

export function CourseRegistration({courseID} : {courseID : string}) {
    const [user, setUser] = useState(undefined as unknown as User);
    const DEFAULT_TEXT = "Select a user";

    function onSelected(user : User) {
        setUser(user);
    }

    function enrollUser() {
        if (user === undefined) return;
        courseEnrollUser(courseID, user.ID)
            .then((user : CourseUser) => {
                console.log("enrolled");
                console.log(user);
            });
        setUser(undefined as unknown as User);
    }

    return (
        <div>
            <p>Name: {user === undefined ? DEFAULT_TEXT : user.name}</p>
            <p>Email: {user === undefined ? DEFAULT_TEXT : user.email}</p>

            <UserSearch
                onSelected={onSelected}
            />

            <button onClick={enrollUser}>
                Enroll User
            </button>
        </div>
    )

}