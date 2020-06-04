import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";

import {CacheItem, CacheState} from "../../../helpers/api/Cache";
import {User} from "../../../../../models/api/User";

import {useSubscription, useObservable} from "observable-hooks";
import {useCurrentUser} from "../../../helpers/api/APIHooks";

import {Area} from "../../general/Area";
import {FeedbackError} from "../../feedback/FeedbackError";
import {FeedbackContent} from "../../feedback/Feedback";
import {CheckboxInput} from "../../input/CheckboxInput";
import {LabeledInput} from "../../input/LabeledInput";
import { FeedbackSuccess } from "../../feedback/FeedbackSuccess";

export function UserSettingsGeneral() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [researchAllowed, setResearchAllowed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false as FeedbackContent);
    const [success, setSuccess] = useState(false as FeedbackContent);
    const user = useCurrentUser();
    
    const userObservable = useObservable(() => user.observable);
    useSubscription(userObservable, course => {
        const user = (course as CacheItem<User>).value;
        setName(user?.name || "");
        setEmail(user?.email || "");
        setResearchAllowed(user?.researchAllowed || false);
        setLoading(course.state !== CacheState.Loaded);
    });
    
    const handleUpdate = () => {
        setSuccess(false);
        setError(false);
        user.update({name, email, researchAllowed})
            .then(_ => setSuccess("Your settings were successfully updated"))
            .catch(error => setError(`Failed to update course: ${error}`));
    };
    
    return <Form>
        <LabeledInput label="Name">
            <Form.Control
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event: React.FormEvent<HTMLInputElement>) => setName((event.target as HTMLInputElement).value)}
            />
        </LabeledInput>
        <LabeledInput label="Email">
            <Form.Control
                type="text"
                placeholder="Your email"
                value={email}
                onChange={(event: React.FormEvent<HTMLInputElement>) => setEmail((event.target as HTMLInputElement).value)}
            />
        </LabeledInput>
        <LabeledInput label="Research">
            <Area className="ml-2 my-2">
                <CheckboxInput
                    value="researchAllowed"
                    selected={researchAllowed}
                    onChange={setResearchAllowed}>
                    I consent to the use of my comments and submissions for research purposes, as described <a>here</a>.
                </CheckboxInput>
            </Area>
        </LabeledInput>
        <FeedbackError close={setError}>{error}</FeedbackError>
        <FeedbackSuccess close={setSuccess} timeout={3000}>{success}</FeedbackSuccess>
        <Button onClick={handleUpdate} disabled={loading}>Update</Button>
    </Form>;
}