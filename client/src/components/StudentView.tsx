import * as React from "react";
import { Route, Switch } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "./Home";
import Login from "./Login";
import axios from 'axios';
class StudentView extends React.Component {
    state: { file: any }
    constructor(props: any) {
        super(props);
        this.state = {
            file: null
        }
    }
    onSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('file', this.state.file);
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        };
        axios.post('/uploadfile', formData, config
        ).then((response) => {
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
            file: event.target.files[0]
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
            </div>
        )
    }
} export default StudentView;