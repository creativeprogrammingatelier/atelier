import React, {useState} from "react";
import {Alert} from "react-bootstrap";

interface ErrorProperties {
	children?: string | JSX.Element | JSX.Element[]
}
export function FeedbackError({children}: ErrorProperties) {
	const [visible, setVisible] = useState(true);

	return visible && <Alert dismissible variant="danger" className="my-2" onClose={() => setVisible(false)}>{children}</Alert>
}