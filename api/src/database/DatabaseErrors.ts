export class NotFoundDatabaseError extends Error {
    constructor(message = "The requested item could not be found.") {
        super(message);
    }
}