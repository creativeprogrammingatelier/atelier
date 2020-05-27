import React, { Fragment, useState } from "react";
import { Button, Form } from "react-bootstrap";

import { useCurrentUser } from "../helpers/api/APIHooks";
import { Cached } from "./general/loading/Cached";
import { Area } from "./general/Area";
import { CheckboxInput } from "./input/CheckboxInput";
import { ParentalProperties } from "../helpers/ParentHelper";

export function ResearchPermissionWrapper({ children }: ParentalProperties) {
    const currentUser = useCurrentUser();
    return <Cached cache={currentUser} wrapper={() => children}>
        {user => {
            if (user.researchAllowed !== undefined && user.researchAllowed !== null) {
                return children;
            } else {
                return <ResearchPermissionOverlay>{children}</ResearchPermissionOverlay>;
            }
        }}
    </Cached>
}

function ResearchPermissionOverlay({ children }: ParentalProperties) {
    const currentUser = useCurrentUser();
    const [researchAllowed, setResearchAllowed] = useState(true);
    const handleSubmit = () => currentUser.update({ researchAllowed });

    return <Fragment>
        <div className="overlay">
            <Area className="p-3 mx-auto mt-5 col-8">
                <Form onSubmit={handleSubmit} style={{ textAlign: "center" }}>
                    <Form.Group className="mb-3">
                        <CheckboxInput
                            name="Submissions and comments I make on Atelier may be used for research purposes."
                            value="researchAllowed"
                            selected={researchAllowed}
                            onChange={setResearchAllowed} />
                    </Form.Group>
                    <Form.Group>
                        <Button type="submit">Save</Button>
                    </Form.Group>
                </Form>
            </Area>
        </div>
        {children}
    </Fragment>
}