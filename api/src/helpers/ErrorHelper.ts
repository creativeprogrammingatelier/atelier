import { NextFunction } from "express";
import { handleDatabaseError } from "./DatabaseErrorHelper";

/** Handles common types of errors for a request */
export function handleError(err: Error, next: NextFunction) {
    if (!(
        handleDatabaseError(err, next)
    )) {
        next({ error: "unknown", message: "Something went wrong. Please try again later." });
    }
}