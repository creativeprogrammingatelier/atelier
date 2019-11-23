import AuthHelper from "./AuthHelper";
import axios from "axios";
import fileDownload from "js-file-download";
import { IFile } from "../../models/file";
/**
 * Helpers for request for files
 */
export default class FileHelper {

    static getUsersFiles = (id:String, onSuccess: Function, onFailure: Function) =>{
        AuthHelper.fetch(`files/user/${id}`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: File[]) => {
                onSuccess(json);
            });
        }).catch(function (error) {
            onFailure(error)
        })
    }

    static getAllFiles = (onSuccess: Function, onFailure: Function) => {
        AuthHelper.fetch(`/files`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: File[]) => {
                onSuccess(json)
            });
        }).catch(function (error) {
            onFailure()
        })
    }


    static getFile = (fileId: string, onSuccess: Function, onFailure: Function) => {
        AuthHelper.fetch(`/files/${fileId}`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: IFile) => {
                onSuccess(json);
            }); 
        }).catch(function (error) {
            onFailure(error)
        })

    }

    static downloadFile = (fileId: String, onFailure: Function) => {
        AuthHelper.fetch(`/files/${fileId}/download`, {
            method: "GET",
        }).then((response: Response) => {
        response.json().then((json: IFile) => {
            fileDownload(json.body, json.name);
        })
        }).catch(function (error) {
            onFailure(error)
        })

    }

    static deleteFile = (fileId: Number, onSuccess: Function, onFailure: Function) => {
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
                "Authorization": AuthHelper.getToken()
            }
        };
        axios.delete(`/files/${fileId}`, config
        ).then((response) => {
            onSuccess();
        }).catch(function (error) {
            //TODO Handle errors in a nice way
            onFailure();
        })
    }

    static uploadFile = (file: IFile, onSuccess: Function, onFailure: Function) => {
        const formData = new FormData();
        formData.append('file', file);
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
                "Authorization": AuthHelper.getToken()
            }
        };
        axios.put('/files/', formData, config
        ).then((response) => {
            onSuccess();

        }).catch(function (error) {
            onFailure();    
        })
    }

}
