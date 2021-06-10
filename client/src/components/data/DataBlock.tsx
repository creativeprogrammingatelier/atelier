import React from 'react';
import {Toast, ToastBody, ToastHeader} from 'react-bootstrap';
import {TimeHelper} from '../../helpers/TimeHelper';

import {OptionalLink} from '../general/OptionalLink';
import {Tag, TagProperties} from '../general/Tag';
import {useTime} from './TimeProvider';
import {ParentalProperties} from '../../helpers/ParentHelper';

interface DataBlockProperties extends ParentalProperties {
	/** Destination of OptionalLink component */
	transport?: string,
	/** Title of component */
	title: string,
	/** Data of DataBlock */
	text?: string,
	/** Timestamp*/
	time: Date | string,
	/** Tags associated with DataBlock  */
	tags?: TagProperties[]
}
/**
 * Returns the DataBlock component from specified parameters.
 */
export function DataBlock({transport, title, text, time, tags, children}: DataBlockProperties) {
  const currentTime = useTime();
  return <div className="dataBlock">
    <OptionalLink to={transport ? transport : ''}>
      <Toast>
        <ToastHeader closeButton={false}>
          <strong className="mr-auto">
            <p className="m-0 mr-1 d-inline">{title}</p>
            {tags !== undefined && tags.map((tag) => <Tag {...tag}/>)}
          </strong>
          <small className="text-muted text-right">{typeof time === 'string' ? time : TimeHelper.howLongAgo(time, currentTime)}</small>
        </ToastHeader>
        <ToastBody>
          {text}{children}
        </ToastBody>
      </Toast>
    </OptionalLink>
  </div>;
}
