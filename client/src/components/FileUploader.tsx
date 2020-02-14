import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

import FileHelper from '../../helpers/FileHelper';

import '../styles/file-uploader.scss';

interface FileUploaderProperties {
    update: () => void
}

declare global {
    interface File {
        webkitRelativePath: string
    }

    interface HTMLInputElement {
        webkitdirectory: boolean
    }
}

export function FileUploader({ update }: FileUploaderProperties) {
    const [folderName, updateFolderName] = useState("");
    const [files, updateFiles] = useState([] as File[]);

    let fileInputRef = null as HTMLInputElement | null;

    const folderUploadSupported = (() => {
        const input = document.createElement("input");
        input.type = "file";
        return "webkitdirectory" in input;
    })();

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        for (const file of files) { 
            // TODO Upload as a single project, instead of per file
            FileHelper.uploadFile(file, update, () => alert('File Failed to upload'));
        }
    };

    function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target && event.target.files && event.target.files[0]) {
            updateFiles(Array.from(event.target.files));
        }
    };

    useEffect(() => {
        if (files.length > 0) {
            if (folderUploadSupported) {
                updateFolderName(files[0].webkitRelativePath.split('/')[0]);
            } else {
                updateFolderName(files[0].name.replace(".pde", ""));
            }
        }
    }, [files]);

    useEffect(() => {
        console.log(folderName);
    }, [folderName]);

    return (
        <div className="row">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <ul>
                        <li>
                            <div className="custom-file">
                                {/* <label htmlFor="select-file" className="custom-file-label">Select File</label> */}
                                <input id="select-file"
                                    type="file" 
                                    multiple
                                    ref={x => {
                                        if (x && folderUploadSupported) {
                                            x.webkitdirectory = true;
                                        }
                                        fileInputRef = x;
                                    }}
                                    onChange={handleFileSelection}
                                    accept=".pde" 
                                    required  />
                            </div>

                        </li>
                        <li>
                            <button className="form-control" type="submit" value="Submit"><FontAwesomeIcon icon={faUpload}></FontAwesomeIcon></button>
                        </li>
                    </ul>
                </div>
            </form>
            {folderUploadSupported
             ? <DirectoryStructure filePaths={files.map(f => f.webkitRelativePath)} />
             : <FileSelectionList 
                fileNames={files.map(f => f.name)} 
                selected={folderName + ".pde"} 
                selectedUpdated={name => updateFolderName(name.replace(".pde", ""))} />}
        </div>
    );
}

interface DirectoryStructureProperties {
    filePaths: string[]
}

function DirectoryStructure({ filePaths }: DirectoryStructureProperties) {
    interface Node {
        name: string
        children: Node[]
    }

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

interface FileSelectionListProperties {
    fileNames: string[],
    selected: string,
    selectedUpdated: (name: string) => void
}

function FileSelectionList({ fileNames, selected, selectedUpdated }: FileSelectionListProperties) {
    if (fileNames.length > 0) {
        return (
            <div>
                <p>Choose your main file:</p>
                <ul>{fileNames.map(name =>
                    <li>
                        <input 
                            type="radio"
                            name="main-file"
                            value={name}
                            checked={selected === name}
                            onChange={() => selectedUpdated(name)} />
                        {name}
                    </li>
                )}</ul>
            </div>
        )
    } else {
        return null;
    }
}