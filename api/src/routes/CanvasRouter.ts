import { capture } from "../helpers/ErrorHelper";
import express, {Request, Response} from "express";



import {AuthMiddleware} from "../middleware/AuthMiddleware";
import { getCurrentUserID } from "../helpers/AuthenticationHelper";
import { UserDB } from "../database/UserDB";
import { User } from "../../../models/database/User";
import { Fetch } from "../../../client/src/helpers/api/FetchHelper";

export const canvasRouter = express.Router();
canvasRouter.use(AuthMiddleware.requireAuth);

canvasRouter.get("/linked", capture(async (request: Request, response: Response) => {
    const userID: string = await getCurrentUserID(request);
    const user: any = await UserDB.getUserByID(userID);
    let linked: boolean = (user.canvasrefresh != null && user.canvasrefresh != "")? true : false;
    response.json({linked: linked});
}));

canvasRouter.delete("/link", capture(async (request: Request, response: Response) => {
   console.log("deletion requested")
   const userID: string = await getCurrentUserID(request);
   const user: any = await UserDB.getUserByID(userID);
   let newUser = {userID:userID, canvasrefresh:""}
   let res = await UserDB.updateUser(newUser);
   //TODO check this works
   Fetch.fetch("https://utwente-dev.instructure.com/login/oauth2/token",{method:"delete"});
   response.status(200).send(res)
}));

canvasRouter.get("/link", capture(async (request: Request, response: Response) => {
    let client_id = "182170000000000107";
    response.redirect(`https:///utwente-dev.instructure.com/login/oauth2/auth?client_id=${client_id}&response_type=code&state=YYY&redirect_uri=https://localhost/api/canvas/oauth_complete`)

 }));

 canvasRouter.get("/oauth_complete", capture(async (request: Request, response: Response) => {
    console.log("returned");
    response.redirect('/account');
 }));
 


