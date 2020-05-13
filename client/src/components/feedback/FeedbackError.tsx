import React from "react";
import {Feedback, FeedbackProperties} from "./Feedback";

export function FeedbackError(properties: FeedbackProperties) {
	return <Feedback {...properties} variant="danger"/>;
}