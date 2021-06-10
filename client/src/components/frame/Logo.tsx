import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPalette} from '@fortawesome/free-solid-svg-icons';

/**
 * Component for drawing the Atelier logo on the sidebar.
 */
export function Logo() {
  return <div className="logo text-center mb-4">
    <FontAwesomeIcon size={'7x'} icon={faPalette} color="#FFFFFF"/>
    <h1 className="title">{Math.random() < (1 / 1234) ? 'Atelyay' : 'Atelier'}</h1>
  </div>;
}
