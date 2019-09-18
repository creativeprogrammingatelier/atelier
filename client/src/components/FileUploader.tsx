import * as React from "react";
import { Route, Switch, Link } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import axios from "axios";
import AuthHelper from "../../helpers/AuthHelper";
import FileHelper from "../../helpers/FileHelper";

class FileUploader extends React.Component<{ update: Function }> {
    state: { uploadedFile: any, update: Function }
    constructor(props: { update: Function }) {
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

    handleFileSelection = (event: any) => {
        this.setState({
            uploadedFile: event.target.files[0]
        })
    }

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <input type="file" name="file-pmd" required onChange={this.handleFileSelection} />
                <input type="submit" value="Submit" />
            </form>
        )
    }
} export default FileUploader;