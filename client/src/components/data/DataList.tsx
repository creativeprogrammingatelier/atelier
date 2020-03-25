import React, {useState, Fragment} from "react";
import {Children, Parent, ParentalProperties} from "../../helpers/ParentHelper";
import {Heading} from "../general/Heading";
import {Button} from "react-bootstrap";
import {LoadingIcon} from "../general/loading/LoadingIcon";
import {FiChevronDown, FiChevronUp} from "react-icons/all";
import {IconType} from "react-icons";

interface DataListOptional {
	icon: IconType,
	component: Children
}
interface DataItemListProperties extends ParentalProperties {
	header: string,
	optional?: DataListOptional,
	collapse?: boolean,
	more?: (limit: number, offset: number) => Children
	size?: number
}
export function DataList({header, optional,  collapse, more, size=5, children}: DataItemListProperties) {
	const [data, setData] = useState(children);
	const [optionalCollapsed, setOptionalCollapsed] = useState(true);
	const [contentCollapsed, setContentCollapsed] = useState(false);
	const [offset, setOffset] = useState(0);
	const [complete, setComplete] = useState(Parent.countChildren(children) < size);
	const [loadingMore, setLoadingMore] = useState(false);

	async function loadMore() {
		if (more && !loadingMore) {
			setLoadingMore(true);

			const newChildren = await more(size, offset);
			setComplete(Parent.countChildren(newChildren) < size);
			setOffset(offset + size);
			setData(<Fragment>{data}{newChildren}</Fragment>);

			setLoadingMore(false);
		}
	}

	return <div className="list">
		{Parent.countChildren(data) > 0 &&
			<Heading
				title={header}
				leftButton={optional ? {icon: optional.icon, click: () => setOptionalCollapsed(!optionalCollapsed)} : undefined}
				rightButton={collapse ? {icon: contentCollapsed ? FiChevronDown : FiChevronUp, click: () => setContentCollapsed(!contentCollapsed)} : undefined}
			/>
		}
		{!optionalCollapsed && optional &&
			<div className="m-3">
				{optional.component}
			</div>
		}
		{!contentCollapsed &&
			<div className="m-3">
				<Fragment>
					{data}
					{more && !complete && (loadingMore ? <LoadingIcon/> : <Button onClick={loadMore}>Load More</Button>)}
				</Fragment>
			</div>
		}
	</div>
}