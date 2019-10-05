import { IFile } from "../models/file";
import { IUser } from "../models/user";
import {Request} from "express"
import e = require("express");
import FilesMiddleware from "./FilesMiddleware";
import UserMiddleware from "./UsersMiddleware";

export default class PermissionsMiddleware{

    static checkFileAccessPermission(file: IFile, user: IUser): boolean{
        if (user.id == file.owner || user.role == "ta") {
            return true;
        }
        return false;
    }

    //Checks if a user (using the token in the request) is authorised to access a file
    /**
     * 
     * @param fileId 
     * @param request 
     * @param onAuthorised 
     * @param onUnauthorised 
     * @param onFailure 
     */
    static checkFileAccessPermissionWithId(fileId: String, request: Request, onAuthorised: Function, onUnauthorised: Function, onFailure: Function){
        FilesMiddleware.getFile(fileId, 
            (files: IFile[]) => {
                let file = files[0];
                UserMiddleware.getUser(request, 
                    (user: IUser, request : Request) => {
                        if(this.checkFileAccessPermission(file, user)){
                            onAuthorised(file);
                        }else{
                            onUnauthorised();
                        }
                    },
                    (error: Error) => {console.error(error), onFailure()}
                );
            },
            (error: Error) => {console.error(error), onFailure()}
            );
        }
    }
