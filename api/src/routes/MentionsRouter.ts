import express from "express";

import {removePermissionsMention} from "../database/helpers/APIFilterHelper";
import {getCurrentUserID} from "../database/helpers/AuthenticationHelper";
import {capture} from "../database/helpers/ErrorHelper";
import {getCommonQueryParams} from "../database/helpers/ParamsHelper";

import {MentionsDB} from "../database/MentionsDB";
import {AuthMiddleware} from "../middleware/AuthMiddleware";

export const mentionsRouter = express.Router();
mentionsRouter.use(AuthMiddleware.requireAuth);

mentionsRouter.get("/", capture(async(request, response) => {
	const params = getCommonQueryParams(request);
	const userID = await getCurrentUserID(request);
	const mentions = (await MentionsDB.getMentionsByUser(userID, undefined, params))
		.map(mention => removePermissionsMention(mention));
	response.send(mentions);
}));
mentionsRouter.get("/course/:courseID", capture(async(request, response) => {
	const params = getCommonQueryParams(request);
	const userID = await getCurrentUserID(request);
	const courseID = request.params.courseID;
	const mentions = (await MentionsDB.getMentionsByUser(userID, courseID, params))
		.map(mention => removePermissionsMention(mention));
	response.send(mentions);
}));