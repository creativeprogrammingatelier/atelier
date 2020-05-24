import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";

import {CacheItem, CacheState} from "../../../helpers/api/Cache";
import {User} from "../../../../../models/api/User";

import {useSubscription, useObservable} from "observable-hooks";
import {useCurrentUser} from "../../../helpers/api/APIHooks";

import {Label} from "../../general/Label";
import {FeedbackError} from "../../feedback/FeedbackError";
import {FeedbackContent} from "../../feedback/Feedback";

export function UserSettingsGeneral() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false as FeedbackContent);
    const user = useCurrentUser();
    
    const userObservable = useObservable(() => user.observable);
    useSubscription(userObservable, course => {
        const user = (course as CacheItem<User>).value;
        setName(user?.name || "");
        setEmail(user?.email || "");
        setLoading(course.state !== CacheState.Loaded);
    });
    
    const handleUpdate = () => {
        user.update({name, email})
            .catch(error => setError(`Failed to update course: ${error}`));
    };
    
    return <Form>
        <Form.Label className="w-100">
            <Label>Name</Label>
            <Form.Control
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event: React.FormEvent<HTMLInputElement>) => setName((event.target as HTMLInputElement).value)}
            />
        </Form.Label>
        <Form.Label className="w-100">
            <Label>Email</Label>
            <Form.Control
                type="text"
                placeholder="Your email"
                value={email}
                onChange={(event: React.FormEvent<HTMLInputElement>) => setEmail((event.target as HTMLInputElement).value)}
            />
        </Form.Label>
        <FeedbackError close={setError}>{error}</FeedbackError>
        <Button onClick={handleUpdate} disabled={loading}>Update</Button>
    </Form>;
}