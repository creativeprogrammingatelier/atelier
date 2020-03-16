import * as React from 'react';
import {Loading} from "../general/loading/Loading";
import {getCourses, getCurrentUser, getUser, setUser} from "../../../helpers/APIHelper";
import {User} from "../../../../models/api/User";
import {useState} from "react";
import {InputField} from "../general/InputField";

export function UserSettings() {
    const [reload, setReload] = useState(false);

    const handleNameChange = (value : string) => {
        setUser({name : value})
            .then(() => setReload(true));
    };

    const handleEmailChange = (value : string) => {
        setUser({email : value})
            .then(() => {setReload(true)});
    };

    return (
        <Loading
            loader={ reload => getCurrentUser(false) }
            params={[reload]}
            component={(user : User) => {
                setReload(false);
                return (
                    <div>
                        <p>Current name: {user.name} </p>
                        <p>Current email: {user.email}</p>

                        <InputField callBack={handleNameChange} buttonText="Change name" />
                        <InputField callBack={handleEmailChange} buttonText="Change email" />
                    </div>
                )
            }}
        />
    )
}