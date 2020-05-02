import pino from "pino";
import {config} from "./ConfigurationHelper";

/** Global instance of the logger */
export const logger = pino({
    name: "Server",
    level: 
        config.env === "production"
        ? "info"
        : "debug"
});