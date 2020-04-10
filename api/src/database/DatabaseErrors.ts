export class DatabaseError extends Error {
    constructor(message = "something went wrong with the database") {
        super(message);
    }
}

export class NotFoundDatabaseError extends DatabaseError {
    constructor(message = "The requested item could not be found.") {
        super(message);
    }
}

export class InvalidDatabaseInputError extends DatabaseError {
    constructor(message = "input provided does not match database requirements") {
        super(message)
    }
}

export class MissingFieldDatabaseError extends DatabaseError {
    constructor(message = "input object provided is missing some fields") {
        super(message)
    }
}

export class InvalidDatabaseResponseError extends DatabaseError {
    constructor(message = "The database came back with data that is bs") {
        super(message)
    }
}
