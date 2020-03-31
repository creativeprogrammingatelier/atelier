import React, {useEffect, useState} from "react";
import {Alert, Button} from "react-bootstrap";
import {BootstrapVariant} from "../../helpers/BootstrapHelper";
import {HTMLProperties} from "../../helpers/HTMLHelper";
import {FiX} from "react-icons/all";

export type FeedbackContent = string | false;
export interface FeedbackProperties extends HTMLProperties {
	show: boolean,
	close?: (state: false) => void,
	timeout?: number,
	variant?: BootstrapVariant
}
export function Feedback({show, close, timeout, variant, className, id, key, children}: FeedbackProperties) {
	useEffect(() => {
		if (show && close && timeout) {
			setTimeout(() => {
				close(false);
			}, timeout);
		}
	}, [show]);

	// A component must always return an element or null
	return show ?
		<Alert variant={variant} className={"buttonWrapper my-2 " + className} id={id} key={key}>
			{children}
			{close && <Button onClick={() => close(false)}><FiX/></Button>}
		</Alert>
		:
		null;
}