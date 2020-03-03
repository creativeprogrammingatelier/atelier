/**
 * Api routes relating to user information
 */

import express, {Response, Request} from "express";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import {UserDB} from "../database/UserDB";
import {User} from "../../../models/api/User";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {capture} from "../helpers/ErrorHelper";

export const userRouter = express.Router();

// Authentication is required for all endpoints
userRouter.use(AuthMiddleware.requireAuth);

/**
 * Get a specific user
 */
userRouter.get('/:userID', capture(async(request : Request, response : Response) => {
	const userID : string = request.params.userID;
	// TODO database does not give back correct User
	// const user : User = UserDB.getUserByID(userID);
	// response.status(200).send(user);
	response.status(200).send({});
}));

/**
 * Get current user
 */
userRouter.get('/', capture(async(request : Request, response : Response) => {
	const userID : string = await getCurrentUserID(request);
	// TODO database does not give back correct User
	// const user : User = await UserDB.getUserByID(userID);
	// response.status(200).send(user);
	response.status(200).send({});
}));
