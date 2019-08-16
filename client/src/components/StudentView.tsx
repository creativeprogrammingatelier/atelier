import * as React from "react";
import axios from 'axios';
import FileViewer from './FileViewer'
class StudentView extends React.Component {
    state: { uploadedFile: any }
    constructor(props: any) {
        super(props);
        this.state = {
            uploadedFile: null
        }
    }
    onSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('file', this.state.uploadedFile);
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        };
        axios.post('/uploadfile', formData, config
        ).then((response) => {
            //TODO handle this 
            console.log(response)
        }).catch(function (error) {
            //TODO Handle errors in a nice way
            console.log(error);
        })
    }
    handleInputChange = (event: { target: { value: any; name: any } }) => {
        const { value, name } = event.target;
        this.setState({
            [name]: value
        })
    };

    handleFileSelection = (event: any) => {
        this.setState({
            uploadedFile: event.target.files[0]
        })
    }

    render() {
        return (
            < div >
                <h1>Hello Student</h1>
                <form onSubmit={this.onSubmit}>
                    <input type="file" name="file-pmd" required onChange={this.handleFileSelection} />
                    <input type="submit" value="Submit" />
                </form>
                <FileViewer />
            </div>
        )
    }
} export default StudentView;