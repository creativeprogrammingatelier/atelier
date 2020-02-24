/**
 * Api routes relating to user information
 */


import express, {Response, Request} from "express";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import {UserDB} from "../database/UserDB";
import {User} from "../../../models/database/User";

export const userRouter = express.Router();

// Authentication is required for all endpoints
userRouter.use(AuthMiddleware.requireAuth);

userRouter.get('/:userID',
    (request : Request, result : Response) => {
        UserDB.getUserByID(request.params.userID)
            .then((user : User) => result.send(user))
            .catch((error : any) => result.status(500).send({error: error}));
});
