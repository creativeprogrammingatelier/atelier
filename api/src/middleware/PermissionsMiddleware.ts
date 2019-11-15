import { IFile } from "../../../models/file";
import { IUser } from "../../../models/user";
import {Request, Response} from "express"
import e = require("express");
import FilesMiddleware from "./FilesMiddleware";
import UserMiddleware from "./UsersMiddleware";
import CommentMiddleware from "./CommentMiddleware";
import { IComment } from "../../../models/comment";
import UsersMiddleware from "./UsersMiddleware";

export default class PermissionsMiddleware{

    private static checkFileAccessPermission(file: IFile , user: IUser): boolean{
        if (file && file.owner && user.id && user.id == file.owner || user.role == "ta") {
            return true;
        }
        return false;
    }

    private static checkCommentAccessPermission(comment: any , user: IUser): boolean{
        console.log(comment);
        console.log(user)
        if (comment && ( user.email == comment.author.email || user.role == "ta")) {
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
    static checkFileWithId(request: Request, response: Response, onAuthorised: Function){
        const fileId: String | null = (request.params.fileId) ? request.params.fileId: (request.body.fileId) ? request.body.fileId :  null;
        if(fileId === null){
            console.error('File Id not provided');
            response.status(400).send();
            return;
        }
        FilesMiddleware.getFile(fileId, 
            (file: IFile) => {
                UserMiddleware.getUser(request, 
                    (user: IUser, request : Request) => {
                        if(PermissionsMiddleware.checkFileAccessPermission(file, user)){
                            onAuthorised();
                        }else{
                            response.status(401).send()
                        }
                    },
                    (error: Error) => {console.error(error),response.status(500).send()}
                );
            },
            (error: Error) => {console.error(error), response.status(500).send()}
        );
    }

    static isTa (request: Request, result: Response, onSuccess: Function) {
        UsersMiddleware.getUser(request, (user : IUser) => {
            if (user.role.toLowerCase() == "ta") {
                onSuccess();
            } else {
                result.status(401).send();
            }
        },() => result.status(401).send())
    }

    static checkComment(request: Request, response: Response, onAuthorised: Function){
        const commentId: String | null = (request.params.commentId) ? request.params.commentId: (request.body.commentId) ? request.body.commentId :  null;
        if(commentId === null){
            console.error('File id not provided');
            response.status(400).send();
            return;
        }
        CommentMiddleware.getComment(commentId, 
            (comment: IComment) => {
                UserMiddleware.getUser(request, 
                    (user: IUser, request : Request) => {
                        if(PermissionsMiddleware.checkCommentAccessPermission(comment, user)){
                            onAuthorised();
                        }else{
                            response.status(401).send()
                        }
                    },
                    (error: Error) => {console.error(error); response.status(500).send()}
                );
            },
            (error: Error) => {console.error(error); response.status(500).send()}
            );
    }
}
