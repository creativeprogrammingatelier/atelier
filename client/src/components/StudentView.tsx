import * as React from "react";
import axios from 'axios';
import FileViewer from './FileViewer'
import FileUploader from "./FileUploader";
import AuthHelper from "../../helpers/AuthHelper";
class StudentView extends React.Component {
    state: { files: any[] }
    constructor(props: any) {
        super(props);
        this.state = {
            files: null
        }
        this.getAllFiles();
    }

    getAllFiles = () => {
        AuthHelper.fetch(`/getfiles`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: any) => {
                if (this.state.files != json) {
                    this.setState({
                        files: json
                    })
                }
            });
        }).catch(function (error) {
            console.log(error)
        })
    }

    handleInputChange = (event: { target: { value: any; name: any } }) => {
        const { value, name } = event.target;
        this.setState({
            [name]: value
        })
    };

    newFileAdded = () => {
        this.getAllFiles();
    }


    render() {
        return (
            < div >
                <h1>Hello Student</h1>
                <FileUploader  {...{ update: this.newFileAdded }} />
                <FileViewer {...{ files: this.state.files }} />
            </div>
        )
    }
} export default StudentView;