import * as React from "react";
import axios from "axios";
import { ReactElement } from "react";
import { ReactNodeArray } from "prop-types";
import CodeViewer from "./CodeViewer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileDownload, faEye, faTrash } from '@fortawesome/free-solid-svg-icons'
import AuthHelper from "../../helpers/AuthHelper";
import FileUploader from "./FileUploader";
import FileHelper from "../../helpers/FileHelper";

class FileViewer extends React.Component<{ files: any[], update: Function }> {
    state: { viewedFile: any }

    constructor(props: { files: any[], update: Function }) {
        super(props);
        this.state = {
            viewedFile: null,
        }

    }

    populateTable = () => {
        let rows = [];

        if (this.props.files && this.props.files[0] != undefined) {

            for (let file of this.props.files) {
                rows.push(<tr>
                    <td>{file.name}</td>
                    <td><a key={`download-${file._id}`} href={`/downloadfile?fileId=${file._id}`}><FontAwesomeIcon icon={faFileDownload} /></a></td>
                    <td><button key={`view-${file._id}`} onClick={() => FileHelper.getFile(file._id, (file: any) => this.setState({ viewedFile: file }))}><FontAwesomeIcon icon={faEye} /></button></td>
                    <td><button key={`view-${file._id}`} onClick={() => FileHelper.deleteFile(file._id, () => this.props.update())}><FontAwesomeIcon icon={faTrash} /></button></td>
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