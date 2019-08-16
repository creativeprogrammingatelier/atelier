import * as React from "react";
import axios from 'axios';
import FileViewer from './FileViewer'
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



    render() {
        return (
            < div >
                <h1>Hello Student</h1>
                <FileViewer />
            </div>
        )
    }
} export default StudentView;