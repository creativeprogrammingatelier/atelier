import React from 'react';
import {FiChevronsRight} from 'react-icons/all';

interface CourseButtonProperties {
	display: string,
	icon: string
}
export function PanelButton({display, icon}: CourseButtonProperties) {
	return <div className="panel"><a href="/courseOverview"><h2>{display}</h2><FiChevronsRight size={32}/></a></div>
}