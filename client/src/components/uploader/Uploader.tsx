import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

import FileHelper from '../../../helpers/FileHelper';
import { DirectoryViewer } from './DirectoryViewer';
import { FileSelectionViewer } from './FileSelectionViewer';

import '../styles/file-uploader.scss';

interface UploaderProperties {
    /** Callback to call when uploading is finished */
    update: () => void
}

// Extend the File and HTMLInputElement interfaces with
// with properties to support folder uploading
declare global {
    interface File {
        webkitRelativePath: string
    }

    interface HTMLInputElement {
        webkitdirectory: boolean
    }
}

/** If the browser supports uploading directories, the component
 *  will allow the user to pick a directory and upload it as project.
 *  If folder upload is not supported, the user may choose multiple files
 *  to upload and choose the main file to use for the project name.
 */
export function Uploader({ update }: UploaderProperties) {
    const [folderName, updateFolderName] = useState("");
    const [files, updateFiles] = useState([] as File[]);

    // Directory upload is non-standard, so it is very possible that it doesn't work.
    // Modern Chromium, EdgeHTML and Firefox, but, despite the name, Safari is supposed
    // to have troubles with this, although I've not tested that.
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

    function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
        updateFiles(Array.from(event.target.files));
    };

    // Update the folder name when files are selected
    useEffect(() => {
        if (files.length > 0) {
            if (folderUploadSupported) {
                updateFolderName(files[0].webkitRelativePath.split('/')[0]);
            } else {
                updateFolderName(files[0].name.replace(".pde", ""));
            }
        }
    }, [files]);

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
                                    }}
                                    onChange={handleFilesSelected}
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
             ? <DirectoryViewer filePaths={files.map(f => f.webkitRelativePath)} />
             : <FileSelectionViewer 
                fileNames={files.map(f => f.name)} 
                selected={folderName + ".pde"} 
                selectedUpdated={name => updateFolderName(name.replace(".pde", ""))} />}
        </div>
    );
}