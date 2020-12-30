import { capture } from "../helpers/ErrorHelper";
import express, {Request, Response} from "express";
import {User} from "../../../models/api/User";



import {AuthMiddleware} from "../middleware/AuthMiddleware";
import { getCurrentUserID } from "../helpers/AuthenticationHelper";
import { UserDB } from "../database/UserDB";


export const canvasRouter = express.Router();
canvasRouter.use(AuthMiddleware.requireAuth);

canvasRouter.get("/linked", capture(async (request: Request, response: Response) => {
    const userID: string = await getCurrentUserID(request);
    const user: User = await UserDB.getUserByID(userID);
    let linked: boolean = (user.canvasrefresh != null)? true : false;
    response.status(200).send(linked);
}));



