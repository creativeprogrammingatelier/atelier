import * as React from "react";
import axios from 'axios';
import FileViewer from './FileViewer'
import FileUploader from "./FileUploader";
class StudentView extends React.Component {
    constructor(props: any) {
        super(props);

    }

    handleInputChange = (event: { target: { value: any; name: any } }) => {
        const { value, name } = event.target;
        this.setState({
            [name]: value
        })
    };

    newFileAdded = () => {
        this.forceUpdate();
    }


    render() {
        return (
            < div >
                <h1>Hello Student</h1>
                <FileUploader  {...{ update: this.newFileAdded }} />
                <FileViewer />
            </div>
        )
    }
} export default StudentView;