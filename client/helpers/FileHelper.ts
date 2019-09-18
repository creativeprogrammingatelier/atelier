import AuthHelper from "./AuthHelper";
import axios from "axios";
/**
 * Helpers for request for files
 */
export default class FileHelper {

    static getStudentsFiles = (id:String, onSuccess: Function, onFailure: Function) =>{
        AuthHelper.fetch(`/getStudentFiles?studentId=${id}`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: any) => {
                onSuccess(json);
            });
        }).catch(function (error) {
            console.log(error);
            onFailure(error)
        })
    }

    static getAllFiles = (onSuccess: Function, onFailure: Function) => {
        AuthHelper.fetch(`/getfiles`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: any) => {
                onSuccess(json)
            });
        }).catch(function (error) {
            console.log(error);
            onFailure()
        })
    }


    static getFile = (fileId: string, onSuccess: Function, onFailure: Function) => {
        AuthHelper.fetch(`/getfile?fileId=${fileId}`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: any) => {
                onSuccess(json);
            });
        }).catch(function (error) {
            console.log(error);
            onFailure()
        })

    }

    static deleteFile = (fileId: Number, onSuccess: Function, onFailure: Function) => {
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
                "Authorization": AuthHelper.getToken()
            },
            params: {
                "fileId": fileId,
            }
        };
        axios.delete('/deletefile', config
        ).then((response) => {
            onSuccess();

        }).catch(function (error) {
            //TODO Handle errors in a nice way
            console.log(error)
            onFailure();
        })

    }

    static uploadFile = (file: any, onSuccess: Function, onFailure: Function) => {
        const formData = new FormData();
        formData.append('file', file);
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
                "Authorization": AuthHelper.getToken()
            }
        };
        axios.post('/uploadfile', formData, config
        ).then((response) => {
            onSuccess();

        }).catch(function (error) {
            onFailure();
            console.log(error);
        })
    }

}
