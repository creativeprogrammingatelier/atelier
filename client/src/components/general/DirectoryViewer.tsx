import React, { Fragment } from "react";
import {DataList} from "../data/DataList";
import {DataItem} from "../data/DataItem";


interface File {
	name: string,
	transport?: string
}
interface Node extends File {
	children: Node[]
}
interface TopLevelNode extends Node {
	paths: File[]
}
interface DirectoryViewerProperties {
	/** List of file consisting of a path and possibly a location as given by `webkitRelativePath` */
	filePaths: File[]
}

/** Shows a list of files in a nested directory structure.
 */
export function DirectoryViewer({filePaths}: DirectoryViewerProperties) {
	console.log("Rendering a directory view");
	console.log(filePaths);

	if (filePaths.length === 0) {
		return null;
	}

	const projectFolder = filePaths[0].name.split("/")[0];
	const projectPaths = filePaths.map(path => ({name: path.name.substr(projectFolder.length + 1), transport: path.transport}));

	console.log(projectFolder);
	console.log(projectPaths);

	const topLevelNodes: {[folder: string]: TopLevelNode} = {};
	for (const path of projectPaths) {
		const folder = path.name.split("/")[0];
		const file = path.name.substr(folder.length + 1);

		if (file.length === 0) {
			topLevelNodes[folder] = {name: folder, transport: path.transport, paths: [], children: []};
		} else if (topLevelNodes.hasOwnProperty(folder)) {
			topLevelNodes[folder].paths.push({name: file, transport: path.transport});
		} else {
			topLevelNodes[folder] = {name: folder, transport: path.transport, paths: [{name: path.name.substr(folder.length + 1), transport:path.transport}], children: []};
		}
	}
	for (const folder in topLevelNodes) {
		// TSLint wants this check
		if (topLevelNodes.hasOwnProperty(folder)) {
			console.log(folder);
			console.log(topLevelNodes[folder]);

			for (const path of topLevelNodes[folder].paths) {
				let current = topLevelNodes[folder] as Node;
				for (const folder of path.name.split("/")) {
					let next = current.children.find(child => child.name === folder);
					if (next === undefined) {
						next = {name: folder, children: []};
						current.children.push(next);
					}
					current = next;
				}
				console.log(current);
				current.transport = path.transport;
			}

			console.log(topLevelNodes[folder]);
		}
	}

	return <Fragment>{Object.values(topLevelNodes).map(renderTopLevelNode)}</Fragment>;
}

function renderTopLevelNode(node: TopLevelNode) {
	return <div className="directoryNode directoryTopLevel"><DataItem text={node.name} transport={node.transport}/>{node.children.map(renderNode)}</div>
}
function renderNode(node: Node) {
	return <div className="directoryNode"><DataItem text={node.name} transport={node.transport}/>{node.children.map(renderNode)}</div>
}