import React from 'react';

interface DirectoryViewerProperties {
    /** List of filepaths as given by `webkitRelativePath` */
    filePaths: string[]
}

interface Node {
    name: string
    children: Node[]
}

/** Shows a list of files in a nested directory structure.
 */
export function DirectoryViewer({ filePaths }: DirectoryViewerProperties) {
    const tree: Node = { name: ".", children: [] };
    for (const path of filePaths) {
        let current = tree;
        for (const dir of path.split('/')) {
            let next = current.children.find(c => c.name === dir);
            if (next === undefined) {
                next = { name: dir, children: [] }
                current.children.push(next);
            }
            current = next;
        }
    }

    const renderNode = (node: Node) => 
        <li>
            {node.name}
            {node.children.length > 0 && "/"}
            {node.children.length > 0 &&
             <ul>
                 {node.children.map(renderNode)}
             </ul>}
        </li>;

    if (tree.children.length > 0) {
        return <ul>{renderNode(tree.children[0])}</ul>;
    } else {
        return null;
    }
}