import * as React from 'react';
import CodeViewer from './CodeViewer';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFileDownload, faEye, faTrash} from '@fortawesome/free-solid-svg-icons';
import FileHelper from '../../helpers/FileHelper';
import CommentsViewer from './CommentsViewer';
import {useRef} from 'react';
import {File} from '../../../models/database/File';

class FileViewer extends React.Component<{files: File[], update: Function}> {
	state: {viewedFile: File | null, currentLineNumber: number};
	codeViewerRef: React.RefObject<CodeViewer>;
	constructor(props: {files: File[], update: Function}) {
		super(props);
		this.state = {
			viewedFile: null,
			currentLineNumber: 0
		};
		this.codeViewerRef = React.createRef<CodeViewer>();
	}

	populateTable = () => {
		let rows = [];
		if (this.props.files && this.props.files[0] != undefined) {
			for (let file of this.props.files) {
				rows.push(<tr key={file.fileID} className={this.state.viewedFile != null && this.state.viewedFile.fileID != null && this.state.viewedFile.fileID == file.fileID ? 'table-active' : ''}>
					<td>{file.pathname}</td>
					<td>
						<button key={`download-${file.fileID}`} onClick={() => FileHelper.downloadFile(file.fileID!, () => {
							alert('Failed to download file');
						})}><FontAwesomeIcon icon={faFileDownload}/></button>
					</td>
					<td>
						<button key={`view-${file.fileID}`} onClick={() => FileHelper.getFile(file.fileID!, (file: File) => {
							this.setState({viewedFile: file});
						}, () => alert('Failed to get file'))}><FontAwesomeIcon icon={faEye}/></button>
					</td>
					<td>
						<button key={`view-${file.fileID}`} onClick={() => FileHelper.deleteFile(file.fileID!, () => this.props.update(), () => alert('File deletion has failed'))}><FontAwesomeIcon
							icon={faTrash}/></button>
					</td>
				</tr>);
			}
		}

		if (this.props.files.length > 0) {
			return (
				<div>
					<table className="table">
						<thead>
						<tr key='header'>
							<th scope="col">File Name</th>
							<th scope="col">Download</th>
							<th scope="col">View</th>
							<th scope="col">Delete</th>
						</tr>
						</thead>
						<tbody>
						{(rows) ? rows : null}
						</tbody>
					</table>
				</div>
			);
		}

		return (
			<div>
				No files were uploaded
			</div>
		);

	};

	updateCurrentLineNumber = (lineNumber: number) => {
		this.setState({
			currentLineNumber: lineNumber
		});
	};

	render() {
		return (
			<div>
				<div>
					{this.populateTable()}
				</div>
				<div>
					<div className="row">
						<div className="col-sm-8">
							{(this.state.viewedFile != null) ?
								<CodeViewer {...{file: this.state.viewedFile, cursorLineNumber: this.state.currentLineNumber, cursorCharacterNumber : 0, updateCursorLocation: this.updateCurrentLineNumber}} /> : null}
						</div>
						<div className="col-sm-4">
							{(this.state.viewedFile != null) ?
								<CommentsViewer {...{updateCurrentLineNumber: this.updateCurrentLineNumber, currentLineNumber: this.state.currentLineNumber, file: this.state.viewedFile}} /> : null}
						</div>

					</div>
				</div>
			</div>

		);
	}

}
export default FileViewer;