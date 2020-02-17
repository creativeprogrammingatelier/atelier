import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPalette} from '@fortawesome/free-solid-svg-icons';

export function Logo() {
	return <div className="logo text-center mb-4">
		<FontAwesomeIcon size={'8x'} icon={faPalette} color="#FFFFFF"/>
		<h1 className="title">Atelyay</h1>
	</div>
}