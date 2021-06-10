import React, {useEffect} from 'react';
import {Alert, Button} from 'react-bootstrap';
import {FiX} from 'react-icons/all';

import {BootstrapVariant} from '../../helpers/BootstrapHelper';
import {HTMLProperties} from '../../helpers/HTMLHelper';
import {Parent} from '../../helpers/ParentHelper';

export type FeedbackContent = string | false;
export type FeedbackType = 'success' | 'error';
/**
 * Object for representing feedback messages
 */
export class FeedbackMessage {
	/** Type of Feedback */
	type: FeedbackType;
	/** Content of FeedbackMessage */
	content: FeedbackContent;

	/**
	 * Takes in a FeedbackType and FeedbackContent and constructs the FeedbackMessage.
	 *
	 * @param type Type of feedback, such as 'Error' or 'Success'
	 * @param content Content of message.
	 */
	constructor(type: FeedbackType, content: FeedbackContent) {
	  this.type = type;
	  this.content = content;
	}
}

export interface FeedbackProperties extends HTMLProperties {
	/** Property for whether to show the message.*/
	show?: boolean | FeedbackContent,
	/** Callback function for closing the message*/
	close?: (state: false) => void,
	/** Timeout of messgae */
	timeout?: number,
	variant?: BootstrapVariant
}
/**
 * Component constructed from the props passed in.
 */
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
		<Alert variant={variant} className={'buttonWrapper my-2 ' + className} id={id} key={key}>
		  {children}
		  {close && <Button onClick={() => close(false)}><FiX/></Button>}
		</Alert>		:
		null;
}
