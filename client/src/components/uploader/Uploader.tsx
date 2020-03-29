import React, {useState, useEffect} from "react";

import "../../../../helpers/Extensions";
import {DirectoryViewer} from "../general/DirectoryViewer";
import {defaultValidation, validateProjectClient} from "../../../../helpers/ProjectValidationHelper";

import "../../styles/file-uploader.scss";
import {MAX_PROJECT_SIZE} from "../../../../helpers/Constants";
import {Button, Form, InputGroup} from "react-bootstrap";
import {FileInput} from "../input/FileInput";
import {FakeButton} from "../input/fake/FakeButton";
import {FakeReadOnlyInput} from "../input/fake/FakeReadOnlyInput";
import {FeedbackError} from "../feedback/FeedbackError";
import {RadioInput} from "../input/RadioInput";
import {FiUpload} from "react-icons/all";
import {LoadingIcon} from "../general/loading/LoadingIcon";
import { useSubmissions } from "../../helpers/api/APIHooks";

interface UploaderProperties {
	/** The courseId to upload the submission to */
	courseId: string
}

/** If the browser supports uploading directories, the component
 *  will allow the user to pick a directory and upload it as project.
 *  If folder upload is not supported, the user may choose multiple files
 *  to upload and choose the main file to use for the project name.
 */
export function Uploader({courseId}: UploaderProperties) {
    const {createSubmission} = useSubmissions(courseId);

	const [folderName, updateFolderName] = useState("");
	const [selectedFiles, updateSelectedFiles] = useState([] as File[]);
	const [uploadableFiles, updateUploadableFiles] = useState([] as File[]);
	const [uploading, updateUploading] = useState(false);
	const [validation, updateValidation] = useState(defaultValidation<File>([]));
	const [errors, updateErrors] = useState({upload: false as false | string});

	const uploadPrevented = () => validation.containsNoCodeFiles || validation.invalidProjectName;

	let inputElement = null as HTMLInputElement | null;

	// Directory upload is non-standard, so it is very possible that it doesn't work.
	// Modern Chromium, EdgeHTML and Firefox work, but, despite the name, Safari is supposed
	// to have troubles with this, although I've not tested that.
	const folderUploadSupported = (() => {
		const input = document.createElement("input");
		input.type = "file";
		return "webkitdirectory" in input;
	})();

	function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
		if (event.target.files) {
			console.log("Selected some files");
			console.log(event.target.files);
			updateSelectedFiles(Array.from(event.target.files));
		}
	}
	function handleUploadComplete() {
		updateUploading(false);
		updateErrors(prev => ({...prev, upload: false}));
		if (inputElement) {
			inputElement.value = "";
		}
		updateSelectedFiles([]);
	}
	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!uploadPrevented()) {
			updateUploading(true);
            createSubmission(folderName, uploadableFiles);
            handleUploadComplete();
		}
	}

	useEffect(() => {
		// Update the folder name
		let folderName = "";
		if (selectedFiles.length > 0) {
			if (folderUploadSupported) {
				folderName = selectedFiles[0].webkitRelativePath.split("/")[0];
			} else {
				folderName = selectedFiles[0].name.replace(".pde", "");
			}
		}
		updateFolderName(folderName);

		// Project validation
		if (selectedFiles.length > 0) {
			updateValidation(validateProjectClient(folderName, selectedFiles));
		} else {
			updateValidation(prev => ({...prev, acceptableFiles: []}));
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
	}, [validation]);

	return (
		<Form onSubmit={handleSubmit}>
			<Form.Group>
				<FileInput folders={folderUploadSupported} handleElement={(element) => inputElement = element} handleSelected={handleFilesSelected}>
					<InputGroup>
						<InputGroup.Prepend>
							<FakeButton>Choose files</FakeButton>
						</InputGroup.Prepend>
						<FakeReadOnlyInput>{selectedFiles ? (selectedFiles.length === 1 ? selectedFiles[0].name : (selectedFiles.length + " files selected")) : "No files selected"}</FakeReadOnlyInput>
					</InputGroup>
				</FileInput>
				<div>
					{validation.invalidProjectName && <FeedbackError>Project should contain a file called {folderName}.pde.</FeedbackError>}
					{validation.containsNoCodeFiles && <FeedbackError>Project should contain at least one code file.</FeedbackError>}
					{errors.upload && <FeedbackError>Something went wrong while uploading: {errors.upload}</FeedbackError>}
				</div>
			</Form.Group>
			{selectedFiles.length > 0 &&
			<div>
				{folderUploadSupported ?
					<Form.Group>
						<p>These files will be uploaded:</p>
						<DirectoryViewer filePaths={uploadableFiles.map(file => ({name: file.webkitRelativePath}))}/>
					</Form.Group>
					:
					<Form.Group>
						<p>These files will be uploaded, please select your main project file:</p>
						<RadioInput
							options={uploadableFiles.map(f => f.name)}
							selected={folderName + ".pde"}
							onChange={value => updateFolderName(value.replace(".pde", ""))}
						/>
					</Form.Group>
				}
				{uploadableFiles.length < selectedFiles.length &&
				<div>
					<FeedbackError>
						These files won't be uploaded, because they are too large
						{validation.projectTooLarge && " or the project as a whole would be too large"}:
					</FeedbackError>
					<DirectoryViewer filePaths={selectedFiles.filter(file => !uploadableFiles.includes(file)).map(file => ({name: file.webkitRelativePath}))}/>
				</div>
				}
			</div>
			}
			{uploading ?
				<LoadingIcon/>
				:
				<Button
					className="form-control"
					disabled={uploadPrevented() || selectedFiles.length < 1}
					type="submit"
					value="Submit"
				>
					<FiUpload/> Upload
				</Button>
			}
		</Form>
	);
}