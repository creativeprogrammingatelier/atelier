import React from "react";
import {DataList} from "../general/data/DataList";
import {DataItem} from "../general/data/DataItem";


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

	const topLevelFolders: {[folder: string]: TopLevelNode} = {};
	for (const path of projectPaths) {
		const folder = path.name.split("/")[0];
		const file = path.name.substr(folder.length + 1);

		if (file.length === 0) {
			topLevelFolders[folder] = {name: folder, paths: [], children: []};
		} else if (topLevelFolders.hasOwnProperty(folder)) {
			topLevelFolders[folder].paths.push({name: file, transport: path.transport});
		} else {
			topLevelFolders[folder] = {name: folder, paths: [{name: path.name.substr(folder.length + 1), transport:path.transport}], children: []};
		}
	}
	for (const folder in topLevelFolders) {
		// TSLint wants this check
		if (topLevelFolders.hasOwnProperty(folder)) {
			console.log(folder);
			console.log(topLevelFolders[folder]);

			for (const path of topLevelFolders[folder].paths) {
				let current = topLevelFolders[folder] as Node;
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

			console.log(topLevelFolders[folder]);
		}
	}

	return <DataList header="Uploaded files">{Object.values(topLevelFolders).map(renderTopLevelNode)}</DataList>;
}

function renderTopLevelNode(folder: TopLevelNode) {
	return <div className="directoryNode directoryTopLevel"><DataItem text={folder.name}/>{folder.children.map(renderNode)}</div>
}
function renderNode(node: Node) {
	return <div className="directoryNode"><DataItem text={node.name}/>{node.children.map(renderNode)}</div>
}