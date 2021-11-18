import React, {Fragment} from "react";
import {DirectoryNode} from "./DirectoryNode";

/**
 * File class for representing files in code.
 */
class File {
    /** Name of file */
    name: string;
    /** File type */
    type?: string;
    /** Path to file */
    transport?: string;

    /**
     * Constructs a file object with the given parameters.
     *
     * @param name Name of file
     * @param type File Type
     * @param transport File path
     */
    constructor(name: string, type?: string, transport?: string) {
        this.name = name;
        this.type = type;
        this.transport = transport;
    }
}
/**
 * Node class for representing files.
 */
export class Node extends File {
    /**
     * Children of given file.
     */
    children: Node[];

    /**
     * Constructs a Node object from given parameters.
     *
     * @param name Name of node.
     * @param children Children of node.
     * @param type Node type, same as File type.
     * @param transport Node path.
     */
    constructor(name: string, children: Node[], type?: string, transport?: string) {
        super(name, type, transport);
        this.children = children;
    }
}
/**
 * Class representing a root node, such as a directory.
 */
export class TopLevelNode extends Node {
    /** Paths to children of node, such as the files of a directory */
    paths: File[];

    /**
     * Constructs the TopLevelNode based on the params given.
     *
     * @param name Name of node.
     * @param children Children of node.
     * @param paths Paths of descendant files.
     * @param type Type of node.
     * @param transport Path to node.
     */
    constructor(name: string, children: Node[], paths: File[], type?: string, transport?: string) {
        super(name, children, type, transport);
        this.paths = paths;
    }
}

interface DirectoryViewerProperties {
    /** List of file consisting of a path and possibly a location as given by `webkitRelativePath` */
    filePaths: File[]
}
/**
 * Function returning a list of DirectoryNodes from the filePaths specified.
 */
export function DirectoryViewer({filePaths}: DirectoryViewerProperties) {
    if (filePaths.length === 0) {
        return null;
    }

    const slashPrefixed = filePaths[0].name.startsWith("/");
    const projectFolder = filePaths[0].name.split("/")[slashPrefixed ? 1 : 0];
    const projectPaths = filePaths.map(path =>
        new File(path.name.substr(projectFolder.length + (slashPrefixed ? 2 : 1)), path.type, path.transport));

    const topLevelNodes: {[folder: string]: TopLevelNode} = {};
    for (const path of projectPaths) {
        const folder = path.name.split("/")[0];
        const file = path.name.substr(folder.length + 1);

        if (file.length === 0) {
            // This is a file in this folder
            topLevelNodes[folder] = new TopLevelNode(folder, [], [], path.type, path.transport);
        } else if (Object.prototype.hasOwnProperty.call(topLevelNodes, folder)) {
            // This is a file in a sub-folder that has been added
            topLevelNodes[folder].paths.push(new File(file, path.type, path.transport));
        } else {
            // This is a file in a new sub-folder
            topLevelNodes[folder] = new TopLevelNode(
                folder,
                [],
                [new File(path.name.substr(folder.length + 1), path.type, path.transport)],
                path.type,
                path.transport
            );
        }
    }
    for (const folder in topLevelNodes) {
        // TSLint wants this check
        if (Object.prototype.hasOwnProperty.call(topLevelNodes, folder)) {
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
                current.transport = path.transport;
            }
        }
    }

    return <Fragment>
        {
            Object.values(topLevelNodes).map(node => <DirectoryNode key={node.transport || node.name} node={node}/>)
        }
    </Fragment>;
}
