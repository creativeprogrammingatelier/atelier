import pino from "pino";

/** Global instance of the logger */
export const logger = pino({
    name: "Server"
});