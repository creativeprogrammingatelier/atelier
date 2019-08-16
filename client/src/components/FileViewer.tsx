import * as React from "react";
import axios from "axios";
import { ReactElement } from "react";
import { ReactNodeArray } from "prop-types";
import PDEReader from "./PDEReader";
class FileViewer extends React.Component {
    state: { files: any, viewedFile: any }

    constructor(props: { files: any[] }) {
        super(props);
        this.state = {
            files: this.props,
            viewedFile: null
        }
    }




    componentDidMount = () => {
        axios.get('/getfiles',
        ).then((response) => {
            this.setState({
                files: response.data
            })
        }).catch(function (error) {
        })
    }
    populateTable = () => {
        if (this.state.files[0] == undefined) {
            return;
        }
        let rows = [];
        for (let file of this.state.files) {
            rows.push(<tr>
                <td>{file.name}</td>
                <td><a key={`download-${file._id}`} href={`/downloadfile?fileId=${file._id}`}> Download</a></td>
                <td><button key={`view-${file._id}`} value={file._id} onClick={this.getFile}>View</button></td>
            </tr>);
        }
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">File Name</th>
                        <th scope="col">Download</th>
                        <th scope="col" >View</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}


                </tbody>
            </table>
        )
    }

    getFile = (e: any) => {
        axios.get('/getfile', {
            params: {
                fileId: e.target.value
            },
        }
        ).then((response: any) => {
            this.setState({
                viewedFile: response.data
            })
        }).catch(function (error) {
            // TODO handle erorrs
            console.log(error)
        })
    }



    populateCodeView = () => {
        if (this.state.viewedFile != null) {
            return <PDEReader {...{ file: this.state.viewedFile }} />
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