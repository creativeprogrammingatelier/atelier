import * as React from 'react';
import FileViewer from './FileViewer';
import { Uploader } from './uploader/Uploader';
import FileHelper from '../../helpers/FileHelper';
import {File} from '../../../models/api/File';

class StudentView extends React.Component {
	state: {files: File[]};
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
		FileHelper.getAllFiles((result: File[]) => {
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