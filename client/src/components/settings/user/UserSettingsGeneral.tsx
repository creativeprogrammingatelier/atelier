import React, {useState, Fragment} from "react";
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
import {FeedbackSuccess} from "../../feedback/FeedbackSuccess";
import {Overlay} from "../../general/Overlay";
import {ResearchPermissionInformation} from "../../ResearchPermissionWrapper";
import { getErrorMessage } from "../../../../../helpers/ErrorHelper";

interface ResearchInfoPopupProperties {
    /** Function to handle close of the popup. */
    close: () => void
}

/**
 * Component for the popup for the research info.
 */
function ResearchInfoPopup({ close }: ResearchInfoPopupProperties) {
    return <Overlay>
        <Area className="p-4 mx-auto my-5 col-12 col-sm-10 col-md-8">
            <div className="col-10 mx-auto">
                <ResearchPermissionInformation />
                <div style={{ textAlign: "center" }}>
                    <Button onClick={close}>Close</Button>
                </div>
            </div>
        </Area>
    </Overlay>;
}

/**
 * Component to the manage the settings of a given user.
 */
export function UserSettingsGeneral() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [researchAllowed, setResearchAllowed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false as FeedbackContent);
    const [success, setSuccess] = useState(false as FeedbackContent);
    const [showResearchInfo, setShowResearchInfo] = useState(false);
    const user = useCurrentUser();

    const userObservable = useObservable(() => user.observable);
    useSubscription(userObservable, course => {
        const user = (course as CacheItem<User>).value;
        setName(user?.name || "");
        setEmail(user?.email || "");
        setResearchAllowed(user?.researchAllowed || false);
        setLoading(course.state !== CacheState.Loaded);
    });

    /**
     * Updates the user settings.
     */
    const handleUpdate = () => {
        setSuccess(false);
        setError(false);
        user.update({name, email, researchAllowed})
            .then(_ => setSuccess("Your settings were successfully updated"))
            .catch(error => setError(`Failed to update course: ${getErrorMessage(error)}`));
    };

    /**
     * Function to handle the user setting the research information permission.
     */
    const handleResearchInformationClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        setShowResearchInfo(true);
    };

    return <Fragment>
        {showResearchInfo && <ResearchInfoPopup close={() => setShowResearchInfo(false)} />}
        <Form>
            <LabeledInput label="Name">
                <Form.Control
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName((event.target as HTMLInputElement).value)}
                />
            </LabeledInput>
            <LabeledInput label="Email">
                <Form.Control
                    type="text"
                    placeholder="Your email"
                    value={email}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail((event.target as HTMLInputElement).value)}
                />
            </LabeledInput>
            <LabeledInput label="Research">
                <Area className="ml-2 my-2">
                    <CheckboxInput
                        value="researchAllowed"
                        selected={researchAllowed}
                        onChange={setResearchAllowed}>
                        <p className="m-0 p-0">
                            I consent to the use of my comments and submissions for research purposes,
                            as described <a onClick={handleResearchInformationClick}>here</a>.
                        </p>
                    </CheckboxInput>
                </Area>
            </LabeledInput>
            <FeedbackError close={setError}>{error}</FeedbackError>
            <FeedbackSuccess close={setSuccess} timeout={3000}>{success}</FeedbackSuccess>
            <Button onClick={handleUpdate} disabled={loading}>Update</Button>
        </Form>
    </Fragment>;
}
