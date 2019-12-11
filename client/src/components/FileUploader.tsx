import * as React from "react";
import { Route, Switch, Link } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import axios from "axios";
import AuthHelper from "../../helpers/AuthHelper";
import FileHelper from "../../helpers/FileHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import "../styles/file-uploader.scss";
type FileUploaderState = { uploadedFile: any, update: Function }
type FileUploaderProps =  { update: Function }

class FileUploader extends React.Component<FileUploaderProps, FileUploaderState> {
    constructor(props: FileUploaderProps) {
        super(props)
        this.state = {
            uploadedFile: null,
            update: props.update
        }
    }
    onSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        FileHelper.uploadFile(this.state.uploadedFile, this.props.update, () => alert('File Failed to upload'));
    }

    handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target && event.target.files && event.target.files[0]){ 
            this.setState({
                uploadedFile: event.target.files[0]
            })
        }
    }

    render() {
        return (
            <div className="row">
                <form onSubmit={this.onSubmit}>
                <div className="form-group">
                    <ul>
                        <li>
                            <div className="custom-file">
                                <label htmlFor="select-file" className="custom-file-label">Select File</label>
                                <input id="select-file" type="file" className="custom-file-input "accept=".pde" name="file-pmd" required onChange={this.handleFileSelection} />
                            </div>

                        </li>
                        <li>
                            <button className="form-control" type="submit" value="Submit" ><FontAwesomeIcon icon={faUpload}></FontAwesomeIcon></button>
                        </li>
                    </ul>
                </div>
                </form>
            </div>
        )
    }
} export default FileUploader;