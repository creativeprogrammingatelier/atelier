import React, {useState, Fragment} from "react";
import {Node, TopLevelNode} from "./DirectoryViewer";
import {DataItem} from "../data/DataItem";
import {DataTrigger} from "../data/DataTrigger";
import {FiChevronDown, FiChevronUp} from "react-icons/all";
import {canDisplayType} from "../submission/FileOverview";

interface DirectoryNodeProperties {
    node: Node
}

export function DirectoryNode({node}: DirectoryNodeProperties) {
    const [opened, setOpened] = useState(true);

    return <div className={"directoryNode" + (node instanceof TopLevelNode ? " directoryTopLevel" : "")}>
        {node.children.length > 0 ?
            <Fragment>
                <DataTrigger text={node.name}
                             trigger={{icon: opened ? FiChevronUp : FiChevronDown, click: () => setOpened(!opened)}}/>
                {opened && node.children.map(child => <DirectoryNode key={child.transport || child.name}
                                                                     node={child}/>)}
            </Fragment>
            :
            (node.type && canDisplayType(node.type)) ?
                <DataItem text={node.name} transport={node.transport}/>
                :
                <DataItem text={node.name} className="directoryNodeDisabled"/>
        }
    </div>;
}