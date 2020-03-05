import React from 'react';
import {FiChevronsRight} from 'react-icons/all';
import {Link} from 'react-router-dom';

interface CourseButtonProperties {
	display: string,
	location: string,
	icon: string
}
export function PanelButton({display, location, icon}: CourseButtonProperties) {
	return <div className="panel">
		<Link to={location}>
			<div className="panelText">
				<h3>{display}</h3>
			</div>
			<div className="panelBottom text-right">
				<FiChevronsRight size={32} strokeWidth={1.5}/>
			</div>
		</Link>
	</div>
}