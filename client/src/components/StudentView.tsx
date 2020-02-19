import * as React from 'react';
import axios from 'axios';
import FileViewer from './FileViewer';
import { Uploader } from './uploader/Uploader';
import AuthHelper from '../../helpers/AuthHelper';
import FileHelper from '../../helpers/FileHelper';
import {IFile} from '../../../models/file';

class StudentView extends React.Component {
	state: {files: IFile[]};
	_ismounted: boolean;
	constructor(props: any) {
		super(props);
		this.state = {
			files: []
		};
		this._ismounted = false;
	}

	componentDidMount() {
		this._ismounted = true;
		this.getAllFiles();
	}


	componentWillUnmount() {
		this._ismounted = false;
	}

	getAllFiles = () => {
		FileHelper.getAllFiles((result: IFile[]) => {
				if (result != null && this._ismounted) {
					this.setState({
						files: result
					});
				}

			}, () =>
				alert('Failed to fetch files')
		);
	};


	render() {
		return (
			< div className="bordered-container">
				<div className="row ">
					<div className="col-sm-5 offset-sm-4">
						<br/>
						<Uploader onUploadComplete={this.getAllFiles} />
					</div>
					<div className="col-sm-12 ">
						<br/>
					</div>
					<div className="col-sm-12">
						<FileViewer {...{files: this.state.files, update: this.getAllFiles}} />
					</div>
				</div>
			</div>
		);
	}
}
export default StudentView;