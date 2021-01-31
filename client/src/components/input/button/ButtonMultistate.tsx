import React, {useState} from "react";
import {Button} from "react-bootstrap";

import {BootstrapVariant} from "../../../helpers/BootstrapHelper";
import {HTMLProperties} from "../../../helpers/HTMLHelper";
import {Children} from "../../../helpers/ParentHelper";

interface ButtonMultistateProperties extends HTMLProperties {
	/** Button Theme */
	variant?: BootstrapVariant,
	/** Possible button states */
	states: Children[],
	/** Function for when the button has reached end state */
	finish: () => void
}
/**
 * Component defines a button with multiple states, passed into it as children.
 */
export function ButtonMultistate({variant, states, finish, className, id, key}: ButtonMultistateProperties) {
	const [state, setState] = useState(0);
	
	const handleClick = () => {
		// This could look nicer, but setState is asynchronous
		if (state === states.length - 1) {
			finish();
			setState(0);
		} else {
			setState(state + 1);
		}
	};

	return <Button variant={variant} className={className} id={id} key={key} onClick={handleClick}>{states[state]}</Button>
}