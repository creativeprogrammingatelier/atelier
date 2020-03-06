import React, {useState} from "react";
import {Alert} from "react-bootstrap";
import {ParentalProperties} from "../../helpers/ParentHelper";

export function FeedbackError({children}: ParentalProperties) {
	const [visible, setVisible] = useState(true);

	// A component must always return an element or null
	return visible ? <Alert dismissible variant="danger" className="my-2" onClose={() => setVisible(false)}>{children}</Alert> : null
}