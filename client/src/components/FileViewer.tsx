import * as React from "react";
import CodeViewer from "./CodeViewer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileDownload, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import FileHelper from "../../helpers/FileHelper";
import CommentsViewer from "./CommentsViewer";

class FileViewer extends React.Component<{ files: any[], update?: Function }> {
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
                rows.push(<tr key={file._id}   className={this.state.viewedFile && this.state.viewedFile.id == file._id ? 'table-active': null} >
                    <td>{file.name}</td>
                    <td><button key={`download-${file._id}`} onClick={() => FileHelper.downloadFile(file._id, ()=>{alert("Failed to download file")})}><FontAwesomeIcon icon={faFileDownload} /></button></td>
                    <td><button key={`view-${file._id}`} onClick={() => FileHelper.getFile(file._id, (file: any) => { this.setState({ viewedFile: file })}, () => alert("Failed to get file"))}><FontAwesomeIcon icon={faEye} /></button></td>
                    <td><button key={`view-${file._id}`} onClick={() => FileHelper.deleteFile(file._id, () => this.props.update(), ()=> alert('File deletion has failed'))}><FontAwesomeIcon icon={faTrash} /></button></td>
                </tr>);
            }
        }
        return (
            <div>
                <table className="table">
                    <thead>
                        <tr key='header'>
                            <th scope="col">File Name</th>
                            <th scope="col">Download</th>
                            <th scope="col" >View</th>
                            <th scope="col" >Delete</th>
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
                    {this.populateTable()}
                </div>
                <div>
                    <div className="row">
                        <div className="col-sm-8">
                            {(this.state.viewedFile != null) ? <CodeViewer {...{ file: this.state.viewedFile }} /> : null}
                        </div>
                        <div className="col-sm-4">
                            {(this.state.viewedFile != null) ? <CommentsViewer {...{ file: this.state.viewedFile }} /> : null}
                        </div>

                    </div>
                </div>
            </div>

        )
    }

} export default FileViewer;