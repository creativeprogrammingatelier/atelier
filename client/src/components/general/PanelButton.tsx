import React, {Fragment} from 'react';
import {FiChevronsRight} from 'react-icons/all';
import {Link} from 'react-router-dom';
import {CacheState} from '../../helpers/api/Cache';
import {LoadingIcon} from './loading/LoadingIcon';

interface CourseButtonProperties {
    display: string,
    location: string,
    state?: CacheState
}

function OptionalLink({to, children}: { to?: string, children: React.ReactNode }) {
    if (to !== undefined) {
        return <Link to={to} children={children}/>;
    } else {
        return <Fragment children={children}/>;
    }
}

export function PanelButton({display, location, state = CacheState.Loaded}: CourseButtonProperties) {
    return <div className="panel">
        <OptionalLink to={state === CacheState.Loaded ? location : undefined}>
            <div className="panelText">
                <h3>{display}</h3>
            </div>
            <div className="panelBottom text-right">
                {state === CacheState.Loaded
                    ? <FiChevronsRight size={32} strokeWidth={1.5}/>
                    : <LoadingIcon/>}
            </div>
        </OptionalLink>
    </div>
}
