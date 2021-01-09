import { capture } from "../database/helpers/ErrorHelper";
import express, {Request, Response} from "express";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import { getCurrentUserID } from "../database/helpers/AuthenticationHelper";
import { UserDB } from "../database/UserDB";
import { User } from "../../../models/database/User";
import { Fetch } from "../../../client/src/helpers/api/FetchHelper";
import {createRefreshToken, deleteCanvasLink, getAccessToken, getCourses, getRefreshToken, setUpCanvasLinkJson} from "../database/helpers/CanvasHelper";
//Move all fetches to helper

export const canvasRouter = express.Router();
canvasRouter.use(AuthMiddleware.requireAuth);

canvasRouter.get("/linked", capture(async (request: Request, response: Response) => {
    let refresh_token = await getRefreshToken(request);
    let linked: boolean = (refresh_token  != null && refresh_token != "")? true : false;
    response.json({linked: linked});
}));

canvasRouter.delete("/link", capture(async (request: Request, response: Response) => {
   const userID: string = await getCurrentUserID(request);
   let access_token = await getAccessToken(await getRefreshToken(request));
   let newUser = {userID:userID, canvasrefresh:""}
   await UserDB.updateUser(newUser);
   deleteCanvasLink(access_token)
   response.status(200).send()   
}));

canvasRouter.get("/link", capture(async (request: Request, response: Response) => {
    response.json(setUpCanvasLinkJson())
 }));

 canvasRouter.get("/oauth_complete", capture(async (request: Request, response: Response) => {
   let refresh_token: string = await createRefreshToken(request);
   let userID: string = await getCurrentUserID(request);
   let newUser = {userID:userID, canvasrefresh:refresh_token}
   await UserDB.updateUser(newUser);
   response.redirect('/account');
 }));

 canvasRouter.get("/courses", capture(async (request: Request, response: Response) => {
   response.status(200).send( await getCourses(await getAccessToken(await getRefreshToken(request))))
 }));
 


