import * as React from "react";
import axios from 'axios';
import FileViewer from './FileViewer'
import FileUploader from "./FileUploader";
import AuthHelper from "../../helpers/AuthHelper";
import FileHelper from "../../helpers/FileHelper";
class StudentView extends React.Component {
    state: { files: any[] }
    _ismounted: boolean;
    constructor(props: any) {
        super(props);
        this.state = {
            files: null
        }
    }

    componentDidMount() {
        this._ismounted = true;
        this.getAllFiles()
    }

    handleInputChange = (event: { target: { value: any; name: any } }) => {
        const { value, name } = event.target;
        this.setState({
            [name]: value
        })
    };
      
      componentWillUnmount() {
         this._ismounted = false;
      }

    getAllFiles = () => {
        FileHelper.getAllFiles((result: any) => {
            if (result != null && this._ismounted) {
                this.setState({
                    files: result
                })
            }

        }, () => 
        alert("Failed to fetch files")
        );
    }


    render() {
        return (
            < div >
                <div className="row " >
                    <div className="col-sm-5 offset-sm-4">
                        <br />
                        <FileUploader  {...{ update: this.getAllFiles }} />
                    </div>
                    <div className="col-sm-12 ">
                        <br />
                    </div>
                    <div className="col-sm-12">
                        <FileViewer {...{ files: this.state.files, update: this.getAllFiles }} />
                    </div>
                </div>
            </div>
        )
    }
} export default StudentView;