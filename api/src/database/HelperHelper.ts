import * as pg from "pg"
console.log("helper startup")

const pool = new pg.Pool({
	user: 'assistantassistant',
	host: 'localhost',
	database: 'assistantassistant',
	password: '0disabled-Dusky-lags-Nursery4-Nods-2Floss-Coat-Butte-4Ethel-Hypnosis-bel',
	port: 5432,
	max: 1
});
export const query = pool.query.bind(pool);
export const end = pool.end.bind(pool);

export function extract<T>(result : {rows:T[]}){
	return result.rows;
}
export function one<T>(result : T[]) {
	return result[0];
}
export function map<S, T>(fun : (element : S) => T){
	return (list : S[]) => list.map(fun)
}
export function map2(funs : Function[]) {
	const union = (element : object) => {
		const reducer = (accumulator : object, fun : Function) : object => ({...accumulator,...fun(element)})
		return funs.reduce(reducer, {})
	}
	return map(union)
}
