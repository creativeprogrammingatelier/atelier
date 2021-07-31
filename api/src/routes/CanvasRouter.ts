import { capture } from "../helpers/ErrorHelper";
import express, { Request, Response } from "express";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { getCurrentUserID } from "../helpers/AuthenticationHelper";
import { UserDB } from "../database/UserDB";
import { isCanvasIntegrationEnabled, createRefreshToken, deleteCanvasLink, getAccessToken, getCourses, getRefreshToken, setUpCanvasLinkJson } from "../helpers/CanvasHelper";

export const canvasRouter = express.Router();
canvasRouter.use(AuthMiddleware.requireAuth);

canvasRouter.get("/enabled", capture(async (request: Request, response: Response) => {
    response.json({ enabled: isCanvasIntegrationEnabled() });
}));

canvasRouter.get("/linked", capture(async (request: Request, response: Response) => {
    const refresh_token = await getRefreshToken(request);
    const linked: boolean = (refresh_token != null && refresh_token != "");
    response.json({ linked: linked });
}));

canvasRouter.delete("/link", capture(async (request: Request, response: Response) => {
    const userID: string = await getCurrentUserID(request);
    const access_token = await getAccessToken(await getRefreshToken(request));
    const newUser = { userID: userID, canvasrefresh: "" };
    await UserDB.updateUser(newUser);
    deleteCanvasLink(access_token);
    response.status(200).send();
}));

canvasRouter.get("/link", capture(async (request: Request, response: Response) => {
    response.json(setUpCanvasLinkJson());
}));

canvasRouter.get("/oauth_complete", capture(async (request: Request, response: Response) => {
    const refresh_token: string = await createRefreshToken(request);
    const userID: string = await getCurrentUserID(request);
    const newUser = { userID: userID, canvasrefresh: refresh_token };
    await UserDB.updateUser(newUser);
    response.redirect("/account");
}));

canvasRouter.get("/courses", capture(async (request: Request, response: Response) => {
    response.status(200).send(await getCourses(await getAccessToken(await getRefreshToken(request))));
}));
