/**
 * Api routes relating to submission information
 */

import express, {Response, Request} from 'express';
import {SubmissionDB} from "../database/SubmissionDB";
import {Submission} from "../../../models/api/Submission";
import {UUIDHelper} from "../helpers/UUIDHelper";
import {capture} from "../helpers/ErrorHelper";

export const submissionRouter = express.Router();

/**
 * Get submissions of a course
 */
submissionRouter.get('/course/:courseID', capture(async(request: Request, response: Response) => {
    const courseID : string = request.params.courseID;
    // TODO database does not give back correct Submission
    // const submissions : Submission[] = await SubmissionDB.getSubmissionsByCourse(courseID);
    // response.status(200).send(submissions);
    response.status(200).send({});
}));



/**
 * Get submissions of a user
 */
submissionRouter.get('/user/:userID', capture(async(request: Request, response: Response) => {
    const userID : string = request.params.userID;
    // TODO database does not give back correct Submission
    // const submissions : Submission[] = await SubmissionDB.getUserSubmissions(userID);
    // response.status(200).send(submissions);
    response.status(200).send({});
}));

/**
 * Get a specific submission
 */
submissionRouter.get('/:submissionID', capture(async(request: Request, response: Response) => {
    const submissionID : string = request.params.submissionID;
    // TODO database does not give back correct Submission
    // const submission : Submission = await SubmissionDB.getSubmissionById(submissionID);
    // response.status(200).send(submission);
    response.status(200).send({});
}));

/**
 * Create a new submission.
 */
submissionRouter.post('/', capture(async(request: Request, response: Response) => {
    // TODO getUserID, name
    // TODO create transaction for adding a submission: submission, files etc.
    response.status(200).send({});
}));

