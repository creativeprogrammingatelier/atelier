import React, {useState, Fragment, useEffect} from "react";
import {Children, Parent, ParentalProperties} from "../../helpers/ParentHelper";
import {Heading} from "../general/Heading";
import {Button} from "react-bootstrap";
import {LoadingIcon} from "../general/loading/LoadingIcon";
import {FiChevronDown, FiChevronUp} from "react-icons/all";
import {IconType} from "react-icons";

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
	size?: number
}
export function DataList({header, optional,  collapse, more, size=5, children}: DataListProperties) {
	const [data, setData] = useState(children);
	const [collapsed, setCollapsed] = useState(false);
	const [offset, setOffset] = useState(size);
	const [complete, setComplete] = useState(Parent.countChildren(children) < size);
	const [loadingMore, setLoadingMore] = useState(false);

	useEffect(() => {
		console.log("Updating the children of a list");
		console.log(children);
		setData(children);
		setComplete(Parent.countChildren(children) < size);
		setOffset(size);
		// TODO: Updating children resets the load more things, fix that
	}, [children]);

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

	return <div>
		{(optional || Parent.countChildren(data) > 0) &&
			<Heading
				title={header}
				leftButton={(collapse && optional) ? {icon: optional.icon, click: optional.click} : undefined}
				rightButton={collapse ? {icon: collapsed ? FiChevronDown : FiChevronUp, click: () => setCollapsed(!collapsed)} : (optional ? {icon: optional.icon, click: optional.click} : undefined)}
			/>
		}
		{optional && optional.component &&
			<div className="m-3">
				{optional.component}
			</div>
		}
		{!collapsed && Parent.countChildren(data) > 0 &&
			<div className="m-3">
				<Fragment>
					{data}
					{more && !complete && (loadingMore ? <LoadingIcon/> : <Button onClick={loadMore}>Load More</Button>)}
				</Fragment>
			</div>
		}
	</div>
}