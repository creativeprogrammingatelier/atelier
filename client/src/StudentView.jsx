import React, { Component } from "react";
import FileUploader from 'react-firebase-file-uploader'
import firebase from './firebase.js'
import PDEReader from './Components/PDEReader'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from "@fortawesome/fontawesome-svg-core";
import { faEye } from '@fortawesome/free-solid-svg-icons'
library.add(faEye)

class StudentView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            file: '',
            fileURL: '',
            progress: 0,
            items: [],
            viewedFileURL: ''
        }

        // This binding is necessary to make `this` work in the callback
        this.handleLinkClick = this.handleLinkClick.bind(this);
    }

    storageRef = firebase.storage().ref('code');
    dbRef = firebase.firestore().collection('codeFileRefs')

    componentWillMount() {
        this.dbRef.onSnapshot(querySnapshot => {
            var items = querySnapshot.docs.map(function (documentSnapshot) {
                return documentSnapshot.data();
            });
            const newState = [];
            for (let item in items) {
                newState.push({
                    id: item,
                    title: items[item].filename,
                    fileURL: items[item].fileURL
                });
            }
            this.setState({
                items: newState,
            })
        });

    }

    handleUploadStart = () => {
        this.setState({
            progress: 0
        })
    }

    handleProgress = progress => this.setState({ progress });

    handleUploadError = error => {
        this.setState({ isUploading: false });
        console.error(error);
    };

    handleUploadSuccess = filename => {
        this.setState({
            filename: filename,
            progress: 100
        })
        this.storageRef.child(filename).getDownloadURL()
            .then(url => {
                this.setState({
                    fileURL: url
                })
                this.dbRef.add({
                    filename: filename,
                    fileURL: url
                })
            })
    }

    handleLinkClick = (e, fileURL) => {
        this.setState({
            viewedFileURL: fileURL,
        })
    }

    render() {
        console.log(this.state)
        return (
            <div>
                <h2>Welcome, student</h2>
                <label style={{ padding: 10, borderRadius: 4, pointer: 'cursor' }}>
                    <FileUploader
                        name='file'
                        storageRef={this.storageRef}
                        onUploadStart={this.handleUploadStart}
                        onUploadSuccess={this.handleUploadSuccess}
                        onUploadError={this.handleUploadError}
                        onProgress={this.handleProgress}
                    /> </label>

                <div>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">File name</th>
                                <th scope="col">Download</th>
                                <th scope="col">View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.items.map((item, index) => {
                                return (
                                    <tr>
                                        <td>{item.title}</td>
                                        <td><a href={item.fileURL}>Download link</a></td>
                                        <td><FontAwesomeIcon icon="eye" onClick={(e) => this.handleLinkClick(e, item.fileURL)} /></td>
                                    </tr>)
                            })}
                        </tbody>
                    </table>

                </div>

                <PDEReader file={this.state.viewedFileURL}/>

            </div>
        )
    }
}

export default StudentView;