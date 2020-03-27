import React from 'react';
import {FiChevronsRight} from 'react-icons/all';
import {Link} from 'react-router-dom';
import { CacheState } from '../../helpers/api/Cache';
import { LoadingIcon } from './loading/LoadingIcon';

interface CourseButtonProperties {
	display: string,
	location: string,
	state?: CacheState
}
export function PanelButton({display, location, state = "Loaded"}: CourseButtonProperties) {
	return <div className="panel">
		<Link to={location}>
			<div className="panelText">
				<h3>{display}</h3>
			</div>
			<div className="panelBottom text-right">
                {state === "Loaded"
				 ? <FiChevronsRight size={32} strokeWidth={1.5}/>
                 : <LoadingIcon /> }
			</div>
		</Link>
	</div>
}
