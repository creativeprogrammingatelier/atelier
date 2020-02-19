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

export function extract<T>(result : {rows:T[]}){
	return result.rows;
}
export function one<T>(result : T[]) {
	return result[0];
}
export function map<S, T>(fun : (element : S) => T){
	return (list : S[]) => list.map(fun)
}
export function map2<>(funs){
	const union = (element : S) => {
		const reducer = (accumulator, fun) => ({...accumulator,...fun(element)})
		funs.reduce(reducer, {})
	}
	return map(union)
}