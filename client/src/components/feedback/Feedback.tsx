import React, {useEffect} from "react";
import {Alert, Button} from "react-bootstrap";
import {FiX} from "react-icons/all";

import {BootstrapVariant} from "../../helpers/BootstrapHelper";
import {HTMLProperties} from "../../helpers/HTMLHelper";
import {Parent} from "../../helpers/ParentHelper";

export type FeedbackContent = string | false;
export type FeedbackType = "success" | "error";
export class FeedbackMessage {
	type: FeedbackType;
	content: FeedbackContent;
	
	constructor(type: FeedbackType, content: FeedbackContent) {
		this.type = type;
		this.content = content;
	}
}

export interface FeedbackProperties extends HTMLProperties {
	show?: boolean | FeedbackContent,
	close?: (state: false) => void,
	timeout?: number,
	variant?: BootstrapVariant
}
export function Feedback({show, close, timeout, variant, className, id, key, children}: FeedbackProperties) {
	useEffect(() => {
		if (!(show === false) && close && timeout) {
			const handle = setTimeout(() => {
				close(false);
			}, timeout);
			return () => clearTimeout(handle);
		}
	}, [show, children]);
	
	// A component must always return an element or null
	return !(show === false) && Parent.countChildren(children) !== 0 ?
		<Alert variant={variant} className={"buttonWrapper my-2 " + className} id={id} key={key}>
			{children}
			{close && <Button onClick={() => close(false)}><FiX/></Button>}
		</Alert>
		:
		null;
}