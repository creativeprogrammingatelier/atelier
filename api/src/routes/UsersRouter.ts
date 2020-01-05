/**
 * Users Routes File 
 * Author: Andrew Heath
 * Date Created: 19/08/19
 */

/**
 * Dependencies 
 */
var express = require('express');
var router = express.Router();
import UsersMiddleware from "../middleware/UsersMiddleware";
import AuthMiddleWare from "../middleware/AuthMiddleware";
import {Request, Response} from "express"
import PermissionsMiddleware from "../middleware/PermissionsMiddleware";
import { IUser } from "../../../models/user";
import RoutesHelper from "../helpers/RoutesHelper";
import FilesMiddleware from "../middleware/FilesMiddleware";
import { IFile } from "../../../models/file";

router.get('/', AuthMiddleWare.withAuth, PermissionsMiddleware.isAdmin, (request : Request, response: Response) => {
    UsersMiddleware.getAllUsers((data: IUser[]) => response.status(200).send(data), (error : Error) =>response.status(500).send(error));
});

router.delete('/:userId', AuthMiddleWare.withAuth, PermissionsMiddleware.isAdmin, (request : Request, response: Response) => {
    const userId: String =  RoutesHelper.getValueFromParams('userId', request, response);
    FilesMiddleware.getFiles(userId,
         (files: IFile[]) => FilesMiddleware.deleteFilesAndComments(files.map(a=> a._id), 
                                () => UsersMiddleware.deleteUser(userId,() => response.status(201).send(), (error: Error) => response.status(500).send(error)),
                                (error: Error) => response.status(500).send(error))
        , (error: Error) => response.status(500).send(error)
    )
});

router.get('/students', AuthMiddleWare.withAuth, PermissionsMiddleware.isTa, (request : Request, response: Response) => {
    UsersMiddleware.getAllStudents((data: IUser[]) => response.status(200).send(data), (error : Error) =>response.status(500).send(error));
});



module.exports = router;