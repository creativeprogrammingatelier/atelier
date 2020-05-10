import express from "express";

import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { loggerDestination } from "../helpers/LoggingHelper";

/** 
 * API routes that allow us to ingest logs from the frontend, 
 * so we actually know when something goes wrong in production. 
 */
export const clientLoggingRouter = express.Router();
clientLoggingRouter.use(AuthMiddleware.requireAuth);

clientLoggingRouter.post("/", (request, response) => {
    const logs = request.body;
    for (const line of logs) {
        loggerDestination.write(JSON.stringify(line) + "\n");
    }
    response.status(200);
});
