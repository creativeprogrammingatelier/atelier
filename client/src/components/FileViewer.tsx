import * as React from "react";
import axios from "axios";
import { ReactElement } from "react";
import { ReactNodeArray } from "prop-types";
import CodeViewer from "./CodeViewer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileDownload, faEye } from '@fortawesome/free-solid-svg-icons'
import AuthHelper from "../../helpers/AuthHelper";
import FileUploader from "./FileUploader";

class FileViewer extends React.Component {
    state: { files: any, viewedFile: any }

    constructor(props: { files: any[] }) {
        super(props);
        this.state = {
            files: this.props,
            viewedFile: null,

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


    render() {
        return (
            <div>
                <div>
                    <h1>File Viewer</h1>
                    {this.populateTable()}
                </div>
                <div>
                    {(this.state.viewedFile != null) ? <CodeViewer {...{ file: this.state.viewedFile }} /> : null}
                </div>
            </div>

        )
    }

} export default FileViewer;