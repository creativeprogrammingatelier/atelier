import React, {useState, Fragment} from "react";
import {Children, Parent, ParentalProperties} from "../../helpers/ParentHelper";
import {Heading} from "../general/Heading";
import {Button} from "react-bootstrap";
import {LoadingIcon} from "../general/loading/LoadingIcon";
import {FiChevronDown, FiChevronUp} from "react-icons/all";

interface DataItemListProperties extends ParentalProperties {
	header: string,
	collapse?: boolean,
	more?: (limit: number, offset: number) => Children
	size?: number
}
export function DataList({header, collapse, more, size=5, children}: DataItemListProperties) {
	const [data, setData] = useState(children);
	const [collapsed, setCollapsed] = useState(false);
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
		{children && (collapse ?
			<Heading title={header} rightButton={{icon: collapsed ? FiChevronDown : FiChevronUp, click: () => setCollapsed(!collapsed)}}/>
			:
			<Heading title={header}/>
		)}
		{!collapsed &&
			<div className="m-3">
				{data}
				{more && !complete && (loadingMore ? <LoadingIcon/> : <Button onClick={loadMore}>Load More</Button>)}
			</div>
		}
	</div>
}