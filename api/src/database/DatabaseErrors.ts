export class NotFoundDatabaseError extends Error {
    constructor() {
        super("The requested item could not be found.");
    }
}