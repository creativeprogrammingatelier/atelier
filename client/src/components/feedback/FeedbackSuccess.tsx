import React from "react";
import {Feedback, FeedbackProperties} from "./Feedback";

export function FeedbackSuccess(properties: FeedbackProperties) {
	return <Feedback timeout={400000} {...properties} variant="success"/>
}