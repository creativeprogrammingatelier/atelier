import React from "react";
import {DataList} from "../general/data/DataList";
import {DataItem} from "../general/data/DataItem";

interface DirectoryViewerProperties {
	/** List of filepaths as given by `webkitRelativePath` */
	filePaths: string[]
}

interface Node {
	name: string
	children: Node[]
}
interface TopLevelNode extends Node {
	paths: string[]
}

/** Shows a list of files in a nested directory structure.
 */
export function DirectoryViewer({filePaths}: DirectoryViewerProperties) {
	console.log("Rendering a directory view");
	console.log(filePaths);

	if (filePaths.length === 0) {
		return null;
	}

	const projectFolder = filePaths[0].split("/")[0];
	const projectPaths = filePaths.map(path => path.substr(projectFolder.length + 1));

	console.log(projectPaths);

	const topLevelFolders: {[folder: string]: TopLevelNode} = {};
	for (const path of projectPaths) {
		const folder = path.split("/")[0];
		const file = path.substr(folder.length + 1);

		if (file.length === 0) {
			topLevelFolders[folder] = {name: folder, paths: [], children: []};
		} else if (topLevelFolders.hasOwnProperty(folder)) {
			topLevelFolders[folder].paths.push(file);
		} else {
			topLevelFolders[folder] = {name: folder, paths: [path.substr(folder.length + 1)], children: []};
		}
	}
	for (const folder in topLevelFolders) {
		// TSLint wants this check
		if (topLevelFolders.hasOwnProperty(folder)) {
			console.log(folder);
			console.log(topLevelFolders[folder]);

			for (const path of topLevelFolders[folder].paths) {
				let current = topLevelFolders[folder] as Node;
				for (const folder of path.split("/")) {
					let next = current.children.find(child => child.name === folder);
					if (next === undefined) {
						next = {name: folder, children: []};
						current.children.push(next);
					}
					current = next;
				}
			}

			console.log(topLevelFolders[folder]);
		}
	}

	return <DataList header="Uploaded files">{Object.values(topLevelFolders).map(renderTopLevelNode)}</DataList>;
}

function renderTopLevelNode(folder: TopLevelNode) {
	return <div className="directoryNode directoryTopLevel"><DataItem text={folder.name}></DataItem>{folder.children.map(renderNode)}</div>
}
function renderNode(node: Node) {
	return <div className="directoryNode"><DataItem text={node.name}></DataItem>{node.children.map(renderNode)}</div>
}