import React from 'react';
import {Feedback, FeedbackProperties} from './Feedback';

/**
 * Component for Error message.
 */
export function FeedbackError(properties: FeedbackProperties) {
  return <Feedback {...properties} variant="danger"/>;
}
