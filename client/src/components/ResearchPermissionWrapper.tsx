import React, { Fragment, useState } from "react";
import { Button, Form } from "react-bootstrap";

import { useCurrentUser } from "../helpers/api/APIHooks";
import { Cached } from "./general/loading/Cached";
import { Area } from "./general/Area";
import { Overlay } from "./general/Overlay";
import { CheckboxInput } from "./input/CheckboxInput";
import { ParentalProperties } from "../helpers/ParentHelper";

export function ResearchPermissionWrapper({ children }: ParentalProperties) {
    const currentUser = useCurrentUser();
    return <Cached cache={currentUser} wrapper={() => children}>
        {user => {
            if (user.researchAllowed !== undefined && user.researchAllowed !== null) {
                return children;
            } else {
                return <Fragment>
                    <ResearchPermissionOverlay />
                    {children}
                </Fragment>;
            }
        }}
    </Cached>
}

export function ResearchPermissionInformation() {
    return <Fragment>
        <p>You have been invited to use a research prototype of Atelier. The aim of this platform is to improve the process of providing feedback to students on their programming assignments in a tutorial setting.</p>
        <p>Your participation in this study is entirely voluntary. You can indicate consent for your data being used below. You can update this choice later by going to your account settings within Atelier. We plan to take a snapshot of all data on Atelier at the end of the tutorial period. We will take another snapshot at the end of the module.</p>
        <p>If you consent, we will be using the programs that you upload; comments by students, student assistants, and automated tools; and an access count for research purposes. We will keep track of who consents to participating in this research, and who does not. All programs, comments, and usage statistics will be anonymized. Anonymized programs may be used for future research studies that may be similar to this study or may be completely different. Researchers will not contact you for additional permission to use this data. Any data shared with other researchers will not include any information that can directly identify you.</p>
        <p>If you do not consent, you can still use the fully-featured prototype, but your data will not be used in our research.</p>
        <p>We believe there are no known risks associated with participating in this research study, other than the standard risks that are associated with any online activities. Do not share or save any passwords or access tokens.</p>
        <p>For question regarding this research, please contact dr. Ansgar Fehnker (<a href="mailto:ansgar.fehnker@utwente.nl">ansgar.fehnker@utwente.nl</a>).</p>
    </Fragment>;
}

function ResearchPermissionOverlay() {
    const currentUser = useCurrentUser();
    const [researchAllowed, setResearchAllowed] = useState(false);
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        currentUser.update({ researchAllowed });
    } 

    return <Overlay>
        <Area className="p-4 mx-auto my-5 col-12 col-sm-10 col-md-8">
            <Form className="col-10 mx-auto" onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <ResearchPermissionInformation />
                    <CheckboxInput
                        value="researchAllowed"
                        selected={researchAllowed}
                        onChange={setResearchAllowed}>
                        I understand above information, and consent for my comments and submissions to 
                        be used for research purposes, as described above.
                    </CheckboxInput>
                </Form.Group>
                <Form.Group style={{ textAlign: "center" }}>
                    <Button type="submit">{researchAllowed ? "Accept" : "Decline"}</Button>
                </Form.Group>
            </Form>
        </Area>
    </Overlay>;
}