import React from 'react';
import {HTMLProperties} from '../../helpers/HTMLHelper';

interface AreaProperties extends HTMLProperties {
	/** Boolean for whether Area should be transparent. */
	transparent?: boolean
}
/**
 * Component used to create an Area div for sectioning of page.
 */
export function Area({transparent, className, id, key, children}: AreaProperties) {
  return <div className={className + ' area' + (transparent ? ' transparent' : '')} id={id} key={key}>{children}</div>;
}
