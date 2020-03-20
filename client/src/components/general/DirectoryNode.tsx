import React, {useState, Fragment} from "react";
import {Node, TopLevelNode} from "./DirectoryViewer";
import {DataItem} from "../data/DataItem";
import {DataTrigger} from "../data/DataTrigger";
import {FiChevronDown, FiChevronUp} from "react-icons/all";

interface DirectoryNodeProperties {
	node: Node
}
export function DirectoryNode({node}: DirectoryNodeProperties) {
	const [opened, setOpened] = useState(true);

	console.log("Rendering node");
	console.log(node);

	return <div className={"directoryNode" + (node instanceof TopLevelNode ? " directoryTopLevel" : "")}>
		{node.children.length > 0 ?
			<Fragment>
				<DataTrigger text={node.name} trigger={{icon: opened ? FiChevronUp : FiChevronDown, click: () => setOpened(!opened)}}/>
				{opened && node.children.map(child => <DirectoryNode node={child}/>)}
			</Fragment>
				:
			<DataItem text={node.name} transport={node.transport}/>
		}
	</div>
}