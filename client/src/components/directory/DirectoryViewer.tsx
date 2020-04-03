import React, {Fragment} from "react";
import {DirectoryNode} from "./DirectoryNode";

class File {
	name: string;
	type?: string;
	transport?: string;

	constructor(name: string, type?: string, transport?: string) {
		this.name = name;
		this.type = type;
		this.transport = transport;
	}
}
export class Node extends File {
	children: Node[];

	constructor(name: string, children: Node[], type?: string, transport?: string) {
		super(name, type, transport);
		this.children = children;
	}
}
export class TopLevelNode extends Node {
	paths: File[];

	constructor(name: string, children: Node[], paths: File[], type?: string, transport?: string) {
		super(name, children, type, transport);
		this.paths = paths;
	}
}
interface DirectoryViewerProperties {
	/** List of file consisting of a path and possibly a location as given by `webkitRelativePath` */
	filePaths: File[]
}

/** Shows a list of files in a nested directory structure.
 */
export function DirectoryViewer({filePaths}: DirectoryViewerProperties) {
	// console.log("Rendering a directory view");
	// console.log(filePaths);

	if (filePaths.length === 0) {
		return null;
	}

	const slashPrefixed = filePaths[0].name[0] === "/";
	const projectFolder = filePaths[0].name.split("/")[slashPrefixed ? 1 : 0];
	const projectPaths = filePaths.map(path => new File(path.name.substr(projectFolder.length + (slashPrefixed ? 2 : 1)), path.type, path.transport));

	// console.log(projectFolder);
	// console.log(projectPaths);

	const topLevelNodes: {[folder: string]: TopLevelNode} = {};
	for (const path of projectPaths) {
		const folder = path.name.split("/")[0];
		const file = path.name.substr(folder.length + 1);

		if (file.length === 0) {
			// This is a file in this folder
			topLevelNodes[folder] = new TopLevelNode(folder, [], [], path.type, path.transport);
		} else if (topLevelNodes.hasOwnProperty(folder)) {
			// This is a file in a sub-folder that has been added
			topLevelNodes[folder].paths.push(new File(file, path.type, path.transport));
		} else {
			// This is a file in a new sub-folder
			topLevelNodes[folder] = new TopLevelNode(folder, [], [new File(path.name.substr(folder.length + 1), path.type, path.transport)], path.type, path.transport);
		}
	}
	for (const folder in topLevelNodes) {
		// TSLint wants this check
		if (topLevelNodes.hasOwnProperty(folder)) {
			// console.log(folder);
			// console.log(topLevelNodes[folder]);

			for (const path of topLevelNodes[folder].paths) {
				let current = topLevelNodes[folder] as Node;
				for (const folder of path.name.split("/")) {
					let next = current.children.find(child => child.name === folder);
					if (next === undefined) {
						next = new Node(folder, [], current.type);
						current.children.push(next);
					}
					current = next;
				}
				// console.log(current);
				current.transport = path.transport;
			}

			// console.log(topLevelNodes[folder]);
		}
	}

	return <Fragment>{Object.values(topLevelNodes).map(node => <DirectoryNode key={node.transport || node.name} node={node}/>)}</Fragment>;
}