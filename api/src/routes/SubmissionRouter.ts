/**
 * Api routes relating to submission information
 *
 * /api/submission/submissionId
 *  - file[] name, type, fileid
 *  - commentThread[] commentThreadId, comment[],
 */

import express, { Response, Request } from 'express';

export const submissionRouter = express.Router();
