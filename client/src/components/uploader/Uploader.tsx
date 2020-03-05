import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

import '../../../../helpers/Extensions';
import { DirectoryViewer } from './DirectoryViewer';
import { FileSelectionViewer } from './FileSelectionViewer';
import { defaultValidation, validateProjectClient } from '../../../../helpers/ProjectValidationHelper';

import '../../styles/file-uploader.scss';
import { MAX_PROJECT_SIZE } from '../../../../helpers/Constants';
import { JsonFetchError } from '../../../helpers/FetchHelper';
import { createSubmission } from '../../../helpers/APIHelper';
import { Submission } from '../../../../models/database/Submission';

interface UploaderProperties {
    /** The courseId to upload the submission to */
    courseId: string,
    /** Callback to call when uploading is finished */
    onUploadComplete: (submission: Submission) => void
}

/** If the browser supports uploading directories, the component
 *  will allow the user to pick a directory and upload it as project.
 *  If folder upload is not supported, the user may choose multiple files
 *  to upload and choose the main file to use for the project name.
 */
export function Uploader({ courseId, onUploadComplete }: UploaderProperties) {
    const [folderName, updateFolderName] = useState("");
    const [selectedFiles, updateSelectedFiles] = useState([] as File[]);
    const [uploadableFiles, updateUploadableFiles] = useState([] as File[]);
    const [uploading, updateUploading] = useState(false);

    const [validation, updateValidation] = useState(defaultValidation<File>([]));
    const uploadPrevented = () => validation.containsNoCodeFiles || validation.invalidProjectName;

    const [errors, updateErrors] = useState({ upload: false as false | string });

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
            createSubmission(courseId, folderName, uploadableFiles)
            .then(handleUploadComplete)
            .catch(handleUploadError);
        }
    };

    function handleUploadComplete(submission: Submission) {
        updateUploading(false);
        updateErrors(prev => ({ ...prev, upload: false }));
        if (fileInputRef) {
            fileInputRef.value = "";
        }
        updateSelectedFiles([]);
        onUploadComplete(submission);
    }

    function handleUploadError(error: JsonFetchError) {
        console.log(`Error uploading folder: ${error.message}`);
        updateErrors(prev => ({ ...prev, upload: error.message }));
        updateUploading(false);
    }

    function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files) {
            updateSelectedFiles(Array.from(event.target.files));
        }
    };

    useEffect(() => {
        // Update the folder name
        let folderName = "";
        if (selectedFiles.length > 0) {
            if (folderUploadSupported) {
                folderName = selectedFiles[0].webkitRelativePath.split('/')[0];
            } else {
                folderName = selectedFiles[0].name.replace(".pde", "");
            }
        }
        updateFolderName(folderName);

        // Project validation
        if (selectedFiles.length > 0) {
            updateValidation(validateProjectClient(folderName, selectedFiles));
        } else {
            updateValidation(prev => ({ ...prev, acceptableFiles: [] }))
        }
    }, [selectedFiles]);

    useEffect(() => {
        if (validation.projectTooLarge) {
            let uploadable: File[] = [];
            let totalSize = 0;
            for (const file of validation.acceptableFiles.sort((a, b) => a.size - b.size)) {
                console.log(file);
                if (totalSize + file.size < MAX_PROJECT_SIZE) {
                    totalSize += file.size;
                    uploadable = uploadable.concat(file);
                } else {
                    break;
                }
            }
            updateUploadableFiles(uploadable);
        } else {
            updateUploadableFiles(validation.acceptableFiles);
        }
    }, [validation])

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
                    {errors.upload && <li>Something went wrong while uploading: {errors.upload}</li>}
                </ul>
                {selectedFiles.length > 0 &&
                    <div>
                        {folderUploadSupported
                            ? <div>
                                <p>These files will be uploaded:</p>
                                <DirectoryViewer filePaths={uploadableFiles.map(f => f.webkitRelativePath)} />
                            </div>
                            : <div>
                                <p>These files will be uploaded, please select your main project file:</p>
                                <FileSelectionViewer 
                                    fileNames={uploadableFiles.map(f => f.name)} 
                                    selected={folderName + ".pde"} 
                                    selectedUpdated={name => updateFolderName(name.replace(".pde", ""))} />
                            </div>}
                        {uploadableFiles.length < selectedFiles.length &&
                            <div>
                                <p>These files won't be uploaded, because they are too large
                                    { validation.projectTooLarge && " or the project as a whole would be too large" }:</p>
                                <DirectoryViewer filePaths={selectedFiles.filter(f => !uploadableFiles.includes(f)).map(f => f.webkitRelativePath)} />
                            </div>}
                    </div>}
                {uploading 
                ? <span>*Insert spinner* Uploading</span>
                : <button
                    className="form-control" 
                    disabled={uploadPrevented() || selectedFiles.length < 1} 
                    type="submit" 
                    value="Submit">
                        <FontAwesomeIcon icon={faUpload} />
                        <span>Upload</span>
                  </button>}
            </form>
        </div>
    );
}