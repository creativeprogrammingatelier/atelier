import React from "react";
import {Feedback, FeedbackProperties} from "./Feedback";

/**
 * Component for a Success message.
 */
export function FeedbackSuccess(properties: FeedbackProperties) {
	return <Feedback timeout={3000} {...properties} variant="success"/>;
}