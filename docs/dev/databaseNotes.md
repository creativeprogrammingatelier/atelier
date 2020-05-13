# database

There are a set of classes with functions that handle all database connections. These can be found in [the database folder](/api/src/database).
Every file exports a class that contains methods to query one table. These methods will almost always return a model, containing the data retrieved from the database.
These functions handle things like conversion between data types and object transformation to adhere to the required model.

### views

To allow for somewhat complex return types from the database, a number of `TableNameView` views are set up. (found in [ViewDB](/api/src/database/ViewDB.ts)). they contain more data than just the table itself, allowing to create the API models with just one query.
These are handy because any filtering that applies to a table below can be performed in one query, and results of inserts/update/delete can be retrieved in the same call.
(e.g. all commentThreads with 'draw' in the snippet body)

The only exception to this, are the one-to-many relations that exist (submission-file, thread-comment)
It is currently impossible to collect these at the same time as the other data.
These can be added later, with dedicated methods that take the first query call as input.

Inserting, updating and deleting can (generally) only be done within a single table.
to return a full response, the ```WITH queryName AS (insert|update|delete ... RETURNING *)```) syntax is used.
The result of this query is the input for the view (for that table). (the modified table name is replaced with `queryName as`)

### extra options (DBTools)

The input to the most methods is a large object that, besides the table fields, contains more options to configure the queries.
these include:
	limit: set a limit to what number of items is returned. (only used in selects)
	offset: start at location `offset` in the list of items with returning (only used in selects)
	sorting: an optional sorting the query tries to adhere to. what sortings are supported differs from method to method. (currently only used within the search methods)
	client: when doing transactions, a client should be inserted, to let the query use that client when connecting to the database.
	currentUserID: the identifier of the user that is making the request. currently only used within search methods, where at the time of the query it has to be decided if a user is allowed to see that query.

### permissions
when retrieving (course) users from the database, all permissions are be set correctly. They are combined in the database.
NB: the permissions actually come back as a string of 40 binary digits, which are then converted server-side.

### transactions
To perform transactions, you have to pass in the optional **client** argument to the functions that are part of the transaction. When this is passed, instead of starting a new connection, it uses that existing client to perform the query. The easiest way to perform a transaction then involves the **transaction** function in HelperDB.ts. It receives a callback function: the function that contains all transaction query. This callback receives as its first (and only) argument, the client you need to pass to all database calls. the transaction function will take care of the transactional stuff such as BEGIN, COMMIT and ROLLBACK. (ROLLBACK will be run if the callback throws an error.)

### table creation
To create the structure and standard entries required by the system, one can use `npm run database-build`
This will drop any pre-existing tables and views, and create them from scratch.
These tables will almost all be empty, except for the global- and localRole tables, which will be filled with the standard roles and permissions.
When running in a development environment, one can opt to use `npm run database-dev` instead, which inserts dummy data into all tables besides creating them. This allows for quick rebuilding whenever needed.
The insertion of dummy data can also be done later with `npm run database-samples`.

### tests
The tests that are run with `npm run test-backend[-nyc]` require the database to be filled with at least the sample data to work properly, and may fail when that data is not present.
