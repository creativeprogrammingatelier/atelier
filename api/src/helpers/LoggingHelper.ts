import pino from "pino";
import pinoHttp from "pino-http";
import { IncomingMessage } from "http";
import { config } from "./ConfigurationHelper";

/** Destination for logging */
export const loggerDestination = pino.destination();

/** Global instance of the logger */
export const logger = pino({
    name: "Atelier",
    redact: [ "req.headers.cookie", "res.headers['set-cookie']" ],
    serializers: {
        error: err => ({
            type: err.constructor.name,
            name: err.name,
            message: err.message,
            stack: err.stack,
            reason: err.reason,
            code: err.code,
            detail: err.detail,
        })
    },
    level: 
        config.env === "production"
        ? "info"
        : "debug"
}, loggerDestination);

const requestMessage = (label: string) => (req: IncomingMessage) => 
    // The req field is not defined in any type, but it does seem to exist
    // tslint:disable-next-line: no-any
    `Request${label}: ${(req as any).req?.method} ${(req as any).req?.originalUrl} - ${req.statusCode}`;

export const httpLoggerOptions: pinoHttp.Options = {
    logger,
    customSuccessMessage: requestMessage(""),
    customErrorMessage: requestMessage(" failed")
}