/**
 * Api routes relating to file information
 *
 * /api/file/fileId
 *  - text (no json)
 */

import express, { Response, Request } from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export const fileRouter = express.Router();

// Authentication is required for all endpoints
fileRouter.use(AuthMiddleware.requireAuth);
