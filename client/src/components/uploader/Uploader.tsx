import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { AxiosError } from 'axios';

import '../../../../helpers/Extensions';
import FileHelper from '../../../helpers/FileHelper';
import { DirectoryViewer } from './DirectoryViewer';
import { FileSelectionViewer } from './FileSelectionViewer';
import { defaultValidation, validateProjectClient } from '../../../../helpers/ProjectValidationHelper';

import '../../styles/file-uploader.scss';

interface UploaderProperties {
    /** Callback to call when uploading is finished */
    onUploadComplete: () => void
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

    const [validation, updateValidation] = useState(defaultValidation<File>([]));
    const uploadPrevented = () => validation.containsNoCodeFiles || validation.invalidProjectName;

    const [errors, updateErrors] = useState({ upload: false as boolean | number });

    let fileInputRef = null as HTMLInputElement | null;

    // Directory upload is non-standard, so it is very possible that it doesn't work.
    // Modern Chromium, EdgeHTML and Firefox work, but, despite the name, Safari is supposed
    // to have troubles with this, although I've not tested that.
    const folderUploadSupported = (() => {
        const input = document.createElement("input");
        input.type = "file";
        return "webkitdirectory" in input;
    })();

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!uploadPrevented()) {
            updateUploading(true);
            FileHelper.uploadFolder(folderName, validation.acceptableFiles, handleUploadComplete, handleUploadError);
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

    function handleUploadError(error: AxiosError) {
        console.log(`Error uploading folder: ${error}`);
        updateErrors(prev => ({ ...prev, upload: (error.response?.status || true) }));
        updateUploading(false);
    }

    function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files) {
            updateFiles(Array.from(event.target.files));
        }
    };

    useEffect(() => {
        // Update the folder name
        let folderName = "";
        if (files.length > 0) {
            if (folderUploadSupported) {
                folderName = files[0].webkitRelativePath.split('/')[0];
            } else {
                folderName = files[0].name.replace(".pde", "");
            }
        }
        updateFolderName(folderName);

        // Project validation
        if (files.length > 0) {
            updateValidation(validateProjectClient(folderName, files));
        } else {
            updateValidation(prev => ({ ...prev, acceptableFiles: [] }))
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
                    {validation.invalidProjectName && <li>Project should contain a file called {folderName}.pde.</li>}
                    {validation.containsNoCodeFiles && <li>Project should contain at least one code file.</li>}
                    {errors.upload && <li>Something went wrong while uploading{errors.upload !== true && `, got status ${errors.upload}`}. Please try again.</li>}
                </ul>
                {folderUploadSupported
                ? <div>
                    <p>These files will be uploaded:</p>
                    <DirectoryViewer filePaths={validation.acceptableFiles.map(f => f.webkitRelativePath)} />
                    <p>These files won't be uploaded, for example because they are too large:</p>
                    <DirectoryViewer filePaths={files.filter(f => !validation.acceptableFiles.includes(f)).map(f => f.webkitRelativePath)} />
                  </div>
                : <FileSelectionViewer 
                    fileNames={validation.acceptableFiles.map(f => f.name)} 
                    selected={folderName + ".pde"} 
                    selectedUpdated={name => updateFolderName(name.replace(".pde", ""))} />}
                {uploading 
                ? <span>*Insert spinner* Uploading</span>
                : <button
                    className="form-control" 
                    disabled={uploadPrevented() || files.length < 1} 
                    type="submit" 
                    value="Submit">
                        <FontAwesomeIcon icon={faUpload} />
                        <span>Upload</span>
                  </button>}
            </form>
        </div>
    );
}