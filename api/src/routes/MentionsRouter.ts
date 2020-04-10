import express from 'express';
import {AuthMiddleware} from '../middleware/AuthMiddleware';
import {capture} from '../helpers/ErrorHelper';
import {getCurrentUserID} from '../helpers/AuthenticationHelper';
import {MentionsDB} from '../database/MentionsDB';
import {getCommonQueryParams} from '../helpers/ParamsHelper';
import {removePermissionsMention} from "../helpers/APIFilterHelper";

export const mentionsRouter = express.Router();

mentionsRouter.use(AuthMiddleware.requireAuth);

mentionsRouter.get('/', capture(async (request, response) => {
    const params = getCommonQueryParams(request);
    const userID = await getCurrentUserID(request);
    const mentions = (await MentionsDB.getMentionsByUser(userID, undefined, params))
        .map(mention => removePermissionsMention(mention));
    response.send(mentions);
}));

mentionsRouter.get('/course/:courseID', capture(async (request, response) => {
    const params = getCommonQueryParams(request);
    const userID = await getCurrentUserID(request);
    const courseID = request.params.courseID;
    const mentions = (await MentionsDB.getMentionsByUser(userID, courseID, params))
        .map(mention => removePermissionsMention(mention));
    response.send(mentions);
}));