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
import {Response} from "express"

router.get('/students', AuthMiddleWare.withAuth, AuthMiddleWare.isTa, (request : Request, result: Response) => {
    UsersMiddleware.getAllStudents((data: any) => result.status(200).send(data), (error : Error) =>result.status(500).send(error));
});

module.exports = router;