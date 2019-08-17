import * as React from "react";
import { Route, Switch, Link } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import axios from "axios";
import AuthHelper from "../../helpers/AuthHelper";

class FileUploader extends React.Component {
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
        const formData = new FormData();
        formData.append('file', this.state.uploadedFile);
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
                "Authorization": AuthHelper.getToken()

            }
        };
        axios.post('/uploadfile', formData, config
        ).then((response) => {
            this.state.update();

        }).catch(function (error) {
            //TODO Handle errors in a nice way
            console.log(error);
        })
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