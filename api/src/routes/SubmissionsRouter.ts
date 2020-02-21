/**
 * Api routes relating to submission information
 */

import express, {Response, Request} from 'express';
import SubmissionHelper from "../database/SubmissionHelper";
import {Submission} from "../../../models/Submission";
import {SubmissionNotFound} from "../../../errors/SubmissionNotFound";
import FileHelper from "../database/FileHelper";
import ThreadHelper from "../database/ThreadHelper";
import {courseRouter} from "./CourseRouter";
import {userRouter} from "./UserRouter";

export const submissionsRouter = express.Router();

/** Get submissions of a course
 * @type: get
 * @url: /api/submissions/course/:courseId
 * @return: submissions of a certain course
 */
submissionsRouter.get('/course/:courseID',
    (request: Request, result: Response) => {
        const courseID = request.params.courseID;
        SubmissionHelper.getSubmissionsByCourse(courseID)
            .then((submissions : Submission[]) => {
                result.send(submissions);
            })
            .catch((error: any) => result.status(500).send({error: error}));
    });



/** Get submissions of a user
 * @type get
 * @url: /api/submissions/:userID
 * @param userID : id of the user
 * @param limit? : limit to submissions in the body
 * @return submissions of a user
 */
submissionsRouter.get('/user/:userID',
    (request: Request, result: Response) => {
        const userID : string = request.params.userID;
        const limit : number | undefined = request.body.limit;

        SubmissionHelper.getUserSubmissions(userID, limit)
            .then((data : any) => {
                result.send(data);
            })
            .catch((error : any) => result.status(500).send({error : error}));
    });

/** Create a new submission. Gets userId and name if logged in.
 * @type: post
 * @url /api/submission/
 * @param userId (string) : id of the user
 * @param name (string) : name of the user
 */
submissionsRouter.post('/',
    (request: Request, result: Response) => {
        // TODO get userID from logged in user
        // TODO get name from logged in user
        const userID: string = "00000000-0000-0000-0000-000000000000";
        const name = "Default user";

        SubmissionHelper.addSubmission({userID: userID, name: name})
            .then((data: any) => {
                console.log(data);
                result.send(data);
            })
            .catch((error: any) => result.status(500).send({error: error}));
    });
