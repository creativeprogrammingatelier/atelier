import AuthHelper from './AuthHelper';
import fileDownload from 'js-file-download';
import { Fetch } from './FetchHelper';

/**
 * Helpers for request for files
 * @deprecated This class uses old API endpoints and should not be used
 */
export default class FileHelper {

	static getUsersFiles = (id: String, onSuccess: Function, onFailure: Function) => {
		Fetch.fetch(`files/user/${id}`, {
			method: 'GET'
		}).then((response) => {
			response.json().then((json: File[]) => {
				onSuccess(json);
			});
		}).catch(function(error) {
			onFailure(error);
		});
	};

	static getAllFiles = (onSuccess: Function, onFailure: Function) => {
		Fetch.fetch(`/files`, {
			method: 'GET'
		}).then((response) => {
			response.json().then((json: File[]) => {
				onSuccess(json);
			});
		}).catch(function(error) {
			onFailure();
		});
	};


	static getFile = (fileId: string, onSuccess: Function, onFailure: Function) => {
		console.log(`/files/${fileId}`);
		Fetch.fetch(`/files/${fileId}`, {
			method: 'GET'
		}).then((response) => {
			response.json().then((json: File) => {
				console.log(json);
				onSuccess(json);
			});
		}).catch(function(error) {
			onFailure(error);
		});

	};

	static downloadFile = (fileId: String, onFailure: Function) => {
		Fetch.fetch(`/files/${fileId}/download`, {
			method: 'GET'
		}).then((response: Response) => {
			response.json().then((json: any) => {
				fileDownload(json.body, json.name);
			});
		}).catch(function(error) {
			onFailure(error);
		});

	};

	static deleteFile = (fileId: string, onSuccess: Function, onFailure: Function) => {
        Fetch.fetch(`/files/${fileId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then((response) => {
			onSuccess();
		}).catch(function(error) {
			//TODO Handle errors in a nice way
			onFailure();
		});
	};

	static uploadFile = (file: any, onSuccess: Function, onFailure: Function) => {
		const formData = new FormData();
		formData.append('file', file);
		Fetch.fetch('/files/', {
            method: 'PUT',
            body: formData, 
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then((response) => {
			onSuccess();

		}).catch(function(error) {
			onFailure();
		});
    };
    
    static uploadFolder = (project: string, files: File[], onSuccess: () => void, onFailure: (error: any) => void) => {
        const formData = new FormData();
        formData.append('project', project);
        for (const file of files) {
            formData.append('files', file);
        }
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': AuthHelper.getToken()
            }
        };
        Fetch.fetch('/files/', {
            method: 'PUT',
            body: formData, 
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(_ => onSuccess())
            .catch((err: any) => onFailure(err));
    }

}
