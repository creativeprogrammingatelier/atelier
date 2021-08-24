/** Get the message out of an error that could be an error or a string. */
export function getErrorMessage(error: unknown) {
    if (error instanceof Error)
        return error.message;
    else if (typeof error === "string")
        return error;
    else {
        console.error("Tried to get message out of unknown error type: ", error);
        return "Unknown error type.";
    }
}
