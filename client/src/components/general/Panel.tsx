import React from "react";
import {FiChevronsRight} from "react-icons/all";

import {CacheState} from "../../helpers/api/Cache";

import {LoadingIcon} from "./loading/LoadingIcon";
import {OptionalLink} from "./OptionalLink";

interface PanelProperties {
    /** Text to display in panel */
    display: string,
    /** Target location of panel */
    location: string,
    /** State of a cache item */
    state?: CacheState
}
/**
 * Panel component. Panel consists of a location and a state of a item in the cache,
 * if the state of the item is loaded then the OptionalLink is constructed with the
 * link to the data, otherwise it is undefined.
 */
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
