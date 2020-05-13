# Error handling

## Backend

To simplify error handling on the backend as much as possible, there is really only one place in the entire application where responses with an unsuccessful status code are returned: the central error handler. All other routes in the application only consider the "happy path." To do this, everything that goes wrong is thrown as an error for the error handler to catch and deal with.

An example is a database query for a specific file in the database. If this file does not exist, the database layer throws a `NotFoundDatabaseError`, so the route dealing with returning a file does not have to deal with that case. In the central error handler, all `NotFoundDatabaseErrors` are converted into 404 responses.

One problem arises from throwing errors inside async route handlers: Express does not catch Promise rejections by default, so all errors thrown inside an async route handler eventually lead to a NodeJS Unhandled Promise Rejection warning and an unfinished request. To solve this problem, every asynchronous route is wrapped with the `capture` function, to make sure all rejections are handled as they should be.

For example, a route handler that  gets a file from the database and sends back its contents, looks like this:

```typescript
fileRouter.get('/:fileID/body', capture(async (request, response) => {
    const fileID = request.params.fileID;
    const file = await FileDB.getFileByID(fileID);
    const fileBody = await readFile(file.pathname!);
    response.status(200).set("Content-Type", file.type!).send(fileBody);
}));
```

Both when getting the file from the database and when reading the file from disk, errors may be thrown, so we wrap the normal handler with the `capture` function to make sure these cases are handled.

In the case of a middleware handler, which should be able to call the `next` function, the function `captureNext` can be used instead:

```typescript
const requireAuth: RequestHandler = captureNext(async (request, response, next) => {
    const token = getToken(request);
    if (!token) {
        throw new AuthError("token.notProvided", "...");
    } else {
        await verifyToken(token);
        next();
    }
});
```

### Error information

When the backend encounters an error, some information is send back to the frontend as a JSON object of type `ServerError`. This type has two fields:

- `error`: a machine readable type for the error, e.g. `notfound`, `token.expired`, `token.invalid`, `db.unique`
- message: a human readable message that can be shown to the user

This type can be parsed on the frontend to display the message to the user, or make some other decision based on the error.