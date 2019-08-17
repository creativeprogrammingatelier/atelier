import * as React from "react";
import axios from "axios";
import { ReactElement } from "react";
import { ReactNodeArray } from "prop-types";
import CodeViewer from "./CodeViewer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileDownload, faEye } from '@fortawesome/free-solid-svg-icons'
import AuthHelper from "../../helpers/AuthHelper";

class FileViewer extends React.Component {
    state: { files: any, viewedFile: any, uploadedFile: any }

    constructor(props: { files: any[] }) {
        super(props);
        this.state = {
            files: this.props,
            viewedFile: null,
            uploadedFile: null

        }
        this.getAllFiles()
    }
    getAllFiles = () => {
        AuthHelper.fetch(`/getfiles`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: any) => {
                this.setState({
                    files: json
                })
            });
        }).catch(function (error) {
            console.log(error)
        })
    }

    handleFileSelection = (event: any) => {
        this.setState({
            uploadedFile: event.target.files[0]
        })
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
            this.getAllFiles();

        }).catch(function (error) {
            //TODO Handle errors in a nice way
            console.log(error);
        })
    }
    populateTable = () => {
        //Refactor big time
        let rows = [];

        if (this.state.files[0] != undefined) {

            for (let file of this.state.files) {
                rows.push(<tr>
                    <td>{file.name}</td>
                    <td><a key={`download-${file._id}`} href={`/downloadfile?fileId=${file._id}`}><FontAwesomeIcon icon={faFileDownload} /></a></td>
                    <td><button key={`view-${file._id}`} onClick={() => this.getFile(file._id)}><FontAwesomeIcon icon={faEye} />
                    </button></td>
                </tr>);
            }
        }
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <input type="file" name="file-pmd" required onChange={this.handleFileSelection} />
                    <input type="submit" value="Submit" />
                </form>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">File Name</th>
                            <th scope="col">Download</th>
                            <th scope="col" >View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(rows) ? rows : null}


                    </tbody>
                </table>
            </div>

        )
    }

    getFile = (fileId: string) => {
        AuthHelper.fetch(`/getfile?fileId=${fileId}`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: any) => {
                this.setState({
                    viewedFile: json
                })
            });
        }).catch(function (error) {
            console.log(error)
        })

    }



    populateCodeView = () => {
        if (this.state.viewedFile != null) {
            return <CodeViewer {...{ file: this.state.viewedFile }} />
        }
        return;
    }

    render() {
        return (
            <div>
                <div>
                    <h1>File Viewer</h1>
                    {this.populateTable()}
                </div>
                <div>
                    {this.populateCodeView()}
                </div>
            </div>

        )
    }

} export default FileViewer;