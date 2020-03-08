import express, { Response, Request } from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import {capture} from "../helpers/ErrorHelper";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {requireRole} from "../helpers/PermissionHelper";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {localRole} from "../../../enums/localRoleEnum";
import {CourseRegistrationOutput} from "../../../models/database/CourseRegistration";

export const roleRouter = express.Router();

// Authentication is required for all endpoints
roleRouter.use(AuthMiddleware.requireAuth);

roleRouter.post('/course/:courseID/user/:userID/:role', capture(async(request : Request, response : Response) => {
    const currentUserID : string = await getCurrentUserID(request);
    await requireRole({userID : currentUserID, globalRoles : ["admin"]});

    const courseID : string = request.params.courseID;
    const userID : string = request.params.userID;
    const role : string = request.params.role;
    const courseRegistrationOutput : CourseRegistrationOutput = await CourseRegistrationDB.updateRole({
        userID : userID,
        courseID : courseID,
        role : role as localRole
    });
    response.status(200).send(courseRegistrationOutput);
}));