/** Errors as returned by Postgres */
export interface PostgresError extends Error {
	name: string,
	length: number,
	severity: string,
	code: string,
	detail?: string,
	hint?: string,
	position?: string,
	internalPosition?: string,
	internalQuery?: string,
	where?: string,
	schema?: string,
	table?: string,
	column?: string,
	dataType?: string,
	constraint?: string,
	file?: string,
	line?: string,
	routine?: string,
	context?: string
}

/** A small categorization of errors thrown by Postgres */
export enum PostgresErrorCode {
	/** The unique constraint was violated, this data already exists */
	UNIQUE = 'db.unique',
	/** A constraint was violated */
	INTEGRITY = 'db.integrity',
	/** An error related to data provided in the query */
	DATA = 'db.data',
	/** Some other error relating to the database */
	OTHER = 'db.other'
}

/** Check if an error is thrown by Postgres */
export function isPostgresError(err: Error): err is PostgresError {
  return 'name' in err && 'code' in err;
}

/** Parse the error code of a `PostgresError` */
export function parsePostgresErrorCode(err: PostgresError) {
  if (err.code === '23505') {
    return PostgresErrorCode.UNIQUE;
  } else if (err.code.startsWith('23')) {
    return PostgresErrorCode.INTEGRITY;
  } else if (err.code.startsWith('22')) {
    return PostgresErrorCode.DATA;
  } else {
    return PostgresErrorCode.OTHER;
  }
}
