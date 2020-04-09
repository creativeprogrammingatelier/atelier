import React, {useState, Fragment, useEffect} from "react";
import {Button} from "react-bootstrap";
import {IconType} from "react-icons";
import {FiChevronDown, FiChevronUp} from "react-icons/all";

import {Children, Parent, ParentalProperties} from "../../helpers/ParentHelper";

import {LoadingIcon} from "../general/loading/LoadingIcon";
import {Heading} from "../general/Heading";
import {NonEmpty} from "../general/NonEmpty";

export interface DataListOptional {
	icon: IconType,
	click: () => void,
	component: Children
}
export interface DataListProperties extends ParentalProperties {
	header: string,
	optional?: DataListOptional,
	collapse?: boolean,
	more?: (limit: number, offset: number) => Children
	size?: number,
    empty?: Children,
    childCount?: number
}
export function DataList({header, optional, collapse, more, size=5, empty, children, childCount}: DataListProperties) {
	const [data, setData] = useState(children);
	const [collapsed, setCollapsed] = useState(false);
	const [offset, setOffset] = useState(size);
	const [complete, setComplete] = useState(countChildren(children) < size);
	const [loadingMore, setLoadingMore] = useState(false);

	useEffect(() => {
		setData(children);
		setComplete(countChildren(children) < size);
		setOffset(size);
		// TODO: Updating children resets the load more things, fix that
	}, [children]);

	async function loadMore() {
		if (more && !loadingMore) {
			setLoadingMore(true);

			const newChildren = await more(size, offset);
			setComplete(countChildren(newChildren) < size);
			setOffset(offset + size);
			setData(<Fragment>{data}{newChildren}</Fragment>);

			setLoadingMore(false);
		}
    }
    
    function countChildren(children: Children) {
        if (childCount !== undefined) return childCount;
        return Parent.countChildren(children);
    }

	return <div>
		{(optional || countChildren(data) > 0) &&
			<Heading
				title={header}
				leftButton={(collapse && optional) ? {icon: optional.icon, click: optional.click} : undefined}
				rightButton={collapse ? {icon: collapsed ? FiChevronDown : FiChevronUp, click: () => setCollapsed(!collapsed)} : (optional ? {icon: optional.icon, click: optional.click} : undefined)}
			/>
		}
		{optional && countChildren(optional.component) > 0 &&
			<div className="m-3">
				{optional.component}
			</div>
		}
		{!collapsed &&
			<NonEmpty empty={empty}>
				<div className={countChildren(children) > 0 ? "m-3" : ""}>
					{data}
					{more && !complete && (loadingMore ? <LoadingIcon/> : <Button onClick={loadMore}>Load More</Button>)}
				</div>
			</NonEmpty>
		}
	</div>
}