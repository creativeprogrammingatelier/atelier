/**
 * Api routes relating to submission information
 *
 * /api/submission/submissionId
 *  - file[] name, type, fileid
 *  - commentThread[] commentThreadId, comment[],
 */

import express, { Response, Request } from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export const submissionRouter = express.Router();

// Authentication is required for all endpoints
submissionRouter.use(AuthMiddleware.requireAuth);
