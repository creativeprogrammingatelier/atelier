/**
 * Api routes relating to submission information
 */

import express, { Response, Request } from 'express';
import SubmissionHelper from "../database/SubmissionHelper";
import {Submission} from "../../../models/Submission";
import {SubmissionNotFound} from "../../../errors/SubmissionNotFound";

export const submissionRouter = express.Router();

/** Get a Submission by Id. Returns a 404 if not found.
 * @type: get
 * @url: /api/submission/:submissionId
 * @param submissionId (string) : id of the submission
 * @return Submission or 404
 */
submissionRouter.get('/:submissionId',
    (request : Request, result : Response) => {
        const submissionId : string = request.params.submissionId;

        SubmissionHelper.getSubmissionById(submissionId)
            .then((submission : Submission | undefined) => {
                // Possibly no submission if found
                if (submission == undefined) throw new SubmissionNotFound("Submission not found");
                result.send(submission);
            })
            .catch((error : any) => {
                if (error.name == "SubmissionNotFound") {
                    result.status(404).send({error : error.message});
                } else {
                    result.status(500).send({error : error});
                }
            });
});

/** Create a new submission. Gets userId and name if logged in.
 * @type: post
 * @url /api/submission/
 * @param userId (string) : id of the user
 * @param name (string) : name of the user
 */
submissionRouter.post('/',
    (request : Request, result : Response) => {
        // TODO get userID from logged in user
        // TODO get name from logged in user
        const userID : string = "00000000-0000-0000-0000-000000000000";
        const name = "Default user";

        SubmissionHelper.addSubmission({userID : userID, name : name})
            .then((data : any) => {
                console.log(data);
                result.send(data);
            })
            .catch((error : any) => result.status(500).send({error : error}));
});
