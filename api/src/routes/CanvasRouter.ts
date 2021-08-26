import { capture } from "../helpers/ErrorHelper";
import express, { Request, Response } from "express";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { getCurrentUserID } from "../helpers/AuthenticationHelper";
import { UserDB } from "../database/UserDB";
import { isCanvasIntegrationEnabled, createRefreshToken, deleteCanvasLink, getAccessToken, getCourses, getRefreshToken, setUpCanvasLinkJson } from "../helpers/CanvasHelper";

export const canvasRouter = express.Router();
canvasRouter.use(AuthMiddleware.requireAuth);

// eslint-disable-next-line @typescript-eslint/require-await
canvasRouter.get("/enabled", capture(async (request: Request, response: Response) => {
    response.json({ enabled: isCanvasIntegrationEnabled() });
}));

canvasRouter.get("/linked", capture(async (request: Request, response: Response) => {
    const refreshToken = await getRefreshToken(request);
    const linked: boolean = (refreshToken != null && refreshToken !== "");
    response.json({ linked: linked });
}));

canvasRouter.delete("/link", capture(async (request: Request, response: Response) => {
    const userID = await getCurrentUserID(request);
    const accessToken = await getAccessToken(await getRefreshToken(request));
    const newUser = { userID: userID, canvasrefresh: "" };
    await UserDB.updateUser(newUser);
    deleteCanvasLink(accessToken);
    response.status(200).send();
}));

// eslint-disable-next-line @typescript-eslint/require-await
canvasRouter.get("/link", capture(async (request: Request, response: Response) => {
    response.json(setUpCanvasLinkJson());
}));

canvasRouter.get("/oauth_complete", capture(async (request: Request, response: Response) => {
    const refreshToken = await createRefreshToken(request);
    const userID = await getCurrentUserID(request);
    const newUser = { userID: userID, canvasrefresh: refreshToken };
    await UserDB.updateUser(newUser);
    response.redirect("/account");
}));

canvasRouter.get("/courses", capture(async (request: Request, response: Response) => {
    response.status(200).send(await getCourses(await getAccessToken(await getRefreshToken(request))));
}));
