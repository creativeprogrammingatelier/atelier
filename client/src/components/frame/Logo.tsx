import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPalette} from '@fortawesome/free-solid-svg-icons';

export function Logo() {
	return <div className="logo">
		<FontAwesomeIcon size={'2x'} icon={faPalette} color="#FFFFFF"/>
		<h2 className="title">Atelier</h2>
	</div>
}