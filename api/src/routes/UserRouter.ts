/**
 * Api routes relating to user information
 */


import express, {Response, Request} from "express";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import {UserDB} from "../database/UserDB";
import {User} from "../../../models/database/User";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";

export const userRouter = express.Router();

// Authentication is required for all endpoints
userRouter.use(AuthMiddleware.requireAuth);

userRouter.get('/:userID', (request : Request, result : Response) => {
	UserDB.getUserByID(request.params.userID)
		.then((user : User) => result.send(user))
		.catch((error : any) => result.status(500).send({error: error}));
});

userRouter.get('/', (request : Request, response : Response) => {
	// console.log("The sidebar is finding what the current user is");
	// console.log(getCurrentUserID(request).then(userID => {console.log(userID)}));
	getCurrentUserID(request)
		.then(userID => {
			// console.log("Found user ID "+userID);
			UserDB.getUserByID(userID)
				.then((user : User) => {
					// console.log("Found user object:");
					// console.log(user);
					response.send(user)
				})
				.catch((error : any) => response.status(500).send({error: error}));
		})
		.catch((error: any) => response.status(500).send({error: error}));
});
