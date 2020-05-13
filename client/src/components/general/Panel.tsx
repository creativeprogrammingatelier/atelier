import React from "react";
import {FiChevronsRight} from "react-icons/all";

import {CacheState} from "../../helpers/api/Cache";

import {LoadingIcon} from "./loading/LoadingIcon";
import {OptionalLink} from "./OptionalLink";

interface PanelProperties {
	display: string,
	location: string,
	state?: CacheState
}
export function Panel({display, location, state = CacheState.Loaded}: PanelProperties) {
	return <div className="panel">
		<OptionalLink to={state && CacheState.Loaded ? location : undefined}>
			<div className="panelText">
				<h3>{display}</h3>
			</div>
			<div className="panelBottom text-right">
				{
					state === CacheState.Loaded ?
						<FiChevronsRight size={32} strokeWidth={1.5}/>
						:
						<LoadingIcon/>
				}
			</div>
		</OptionalLink>
	</div>;
}
