import decode from "jwt-decode";
import AuthHelper from "./AuthHelper";
import axios from "axios";
/**
 * Helpers for request for files
 */
export default class FileHelper {

    static getAllFiles = (next: Function) => {
        AuthHelper.fetch(`/getfiles`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: any) => {
                next(json)
            });
        }).catch(function (error) {
            console.log(error)
        })
    }


    static getFile = (fileId: string, next: Function) => {
        AuthHelper.fetch(`/getfile?fileId=${fileId}`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: any) => {
                next(json);
            });
        }).catch(function (error) {
            console.log(error)
        })

    }

    static deleteFile = (fileId: Number, next: Function) => {
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
            next();

        }).catch(function (error) {
            //TODO Handle errors in a nice way
            console.log(error);
        })

    }

    static uploadFile = (file: any, next: Function) => {
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
            next();

        }).catch(function (error) {
            //TODO Handle errors in a nice way
            console.log(error);
        })
    }

}
