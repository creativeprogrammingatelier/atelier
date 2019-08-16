import * as React from "react";
import axios from "axios";
import { ReactElement } from "react";
import { ReactNodeArray } from "prop-types";
class FileViewer extends React.Component {
    state: { files: any }

    constructor(props: { files: any[] }) {
        super(props);
        this.state = {
            files: this.props
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
                <td><a href={`/downloadfile?fileId=${file._id}`}> Download</a></td>
                <td>View</td>
            </tr>);
        }
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">File Name</th>
                        <th scope="col">Download</th>
                        <th scope="col">View</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}


                </tbody>
            </table>
        )
    }

    render() {
        return (
            <div>
                <h1>File Viewer</h1>
                {this.populateTable()}
            </div>
        )
    }

} export default FileViewer;