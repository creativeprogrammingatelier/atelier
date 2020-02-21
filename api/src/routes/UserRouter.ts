/**
 * Api routes relating to user information
 */

import express, { Response, Request } from 'express';
import SubmissionHelper from "../database/SubmissionHelper";
import {Submission} from "../../../models/Submission";

export const userRouter = express.Router();


