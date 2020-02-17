import * as pg from "pg"
console.log("helper startup")

export const pool = new pg.Pool({
	user: 'assistantassistant',
	host: '127.0.0.1',
	database: 'template1',
	password: '0disabled-Dusky-lags-Nursery4-Nods-2Floss-Coat-Butte-4Ethel-Hypnosis-bel',
	port: 5432,
	max: 1
});
