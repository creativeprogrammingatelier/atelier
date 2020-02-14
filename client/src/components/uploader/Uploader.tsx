import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

import FileHelper from '../../../helpers/FileHelper';
import { DirectoryViewer } from './DirectoryViewer';
import { FileSelectionViewer } from './FileSelectionViewer';

import '../../styles/file-uploader.scss';

interface UploaderProperties {
    /** Callback to call when uploading is finished */
    onUploadComplete: () => void
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
export function Uploader({ onUploadComplete }: UploaderProperties) {
    const [folderName, updateFolderName] = useState("");
    const [files, updateFiles] = useState([] as File[]);
    const [uploading, updateUploading] = useState(false);

    const [validationErrors, updateValidationErrors] = useState({ invalidFolderName: false });
    const anyValidationErrors = () => Object.values(validationErrors).reduce((x, y) => x || y);

    const [errors, updateErrors] = useState({ upload: false });

    let fileInputRef = null as HTMLInputElement | null;

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
        if (!anyValidationErrors()) {
            updateUploading(true);
            for (const file of files) { 
                // TODO Upload as a single project, instead of per file
                FileHelper.uploadFile(file, handleUploadComplete, handleUploadError);
            }
        }
    };

    function handleUploadComplete() {
        updateUploading(false);
        updateErrors(prev => ({ ...prev, upload: false }));
        if (fileInputRef) {
            fileInputRef.value = "";
        }
        updateFiles([]);
        onUploadComplete();
    }

    // TODO Fix type, based on return from upload
    function handleUploadError(error: any) {
        console.log(`Error uploading file: ${error}`);
        updateErrors(prev => ({ ...prev, upload: true }));
    }

    function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files) {
            updateFiles(Array.from(event.target.files));
        }
    };

    // Update the folder name and do validation when files are selected
    useEffect(() => {
        let folderName = "";
        if (files.length > 0) {
            if (folderUploadSupported) {
                folderName = files[0].webkitRelativePath.split('/')[0];
            } else {
                folderName = files[0].name.replace(".pde", "");
            }
        }
        updateFolderName(folderName);


        if (files.length > 0 && folderUploadSupported) {
            updateValidationErrors(prev => ({
                ...prev,
                invalidFolderName: !files.some(f => f.webkitRelativePath === `${folderName}/${folderName}.pde`)
            }));
        }
    }, [files]);

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="file" 
                    multiple
                    ref={x => {
                        if (x) fileInputRef = x;
                        if (x && folderUploadSupported) x.webkitdirectory = true;
                    }}
                    onChange={handleFilesSelected}
                    accept=".pde" 
                    required  />
                <ul>
                    {validationErrors.invalidFolderName && <li>Project should contain a file called {folderName}.pde.</li>}
                    {errors.upload && <li>Something went wrong while uploading. Please try again.</li>}
                </ul>
                {folderUploadSupported
                ? <DirectoryViewer filePaths={files.map(f => f.webkitRelativePath)} />
                : <FileSelectionViewer 
                    fileNames={files.map(f => f.name)} 
                    selected={folderName + ".pde"} 
                    selectedUpdated={name => updateFolderName(name.replace(".pde", ""))} />}
                {uploading 
                ? <span>*Insert spinner* Uploading</span>
                : <button
                    className="form-control" 
                    disabled={anyValidationErrors() || files.length < 1} 
                    type="submit" 
                    value="Submit">
                        <FontAwesomeIcon icon={faUpload} />
                        <span>Upload</span>
                  </button>}
            </form>
        </div>
    );
}