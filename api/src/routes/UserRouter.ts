/**
 * Api routes relating to user information
 */

import express, { Response, Request } from 'express';
import {UserDB} from "../database/UserDB";
import {User} from "../../../models/User";

export const userRouter = express.Router();

userRouter.get('/:userID',
    (request : Request, result : Response) => {
        UserDB.getUserByID(request.params.userID)
            .then((user : User) => result.send(user))
            .catch((error : any) => result.status(500).send({error: error}));
});