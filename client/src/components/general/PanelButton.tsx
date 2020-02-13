import React from 'react';
import {FiChevronsRight} from 'react-icons/all';

interface CourseButtonProperties {
	display: string,
	location: string,
	icon: string
}
export function PanelButton({display, location, icon}: CourseButtonProperties) {
	return <div className="panel">
		<a href={location}>
			<div className="panelText">
				<h3>{display}</h3>
			</div>
			<div className="panelBottom text-right">
				<FiChevronsRight size={32}/>
			</div>
		</a>
	</div>
}