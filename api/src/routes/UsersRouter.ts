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
import User, { IUser } from "../../../models/user";
import RoutesHelper from "../helpers/RoutesHelper";
import FilesMiddleware from "../middleware/FilesMiddleware";
import { IFile } from "../../../models/file";
import CommentMiddleware from "../middleware/CommentMiddleware";

router.get('/', AuthMiddleWare.withAuth, PermissionsMiddleware.isAdmin, (request : Request, response: Response) => {
    UsersMiddleware.getAllUsers((data: IUser[]) => response.status(200).send(data), (error : Error) =>response.status(500).send(error));
});

router.delete('/:userId', AuthMiddleWare.withAuth, PermissionsMiddleware.isAdmin, (request : Request, response: Response) => {
    ///TODO fix this 
    const userId: String =  RoutesHelper.getValueFromParams('userId', request, response);
    CommentMiddleware.deleteUserComments(userId, () =>
        FilesMiddleware.deleteUserFiles(userId, () => response.status(201).send(), (error : Error) => response.status(500).send(error)),
        (error : Error) =>response.status(500).send(error)
    )
});

router.get('/students', AuthMiddleWare.withAuth, PermissionsMiddleware.isTa, (request : Request, response: Response) => {
    UsersMiddleware.getAllStudents((data: IUser[]) => response.status(200).send(data), (error : Error) =>response.status(500).send(error));
});

router.put('/', AuthMiddleWare.withAuth, PermissionsMiddleware.isAdmin, (request : Request, response: Response) => {
    UsersMiddleware.updateUser(request.body.user,()=> response.status(200).send(), (error : Error) =>response.status(500).send(error))
});



module.exports = router;