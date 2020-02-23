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

export function toBin(n : number | undefined){
	if (n === undefined) return undefined
	return n.toString(2).padStart(40, '0')
}

export function searchify(input : string){
	return '%'+input.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')+'%'
}
export function extract<T>(result : {rows:T[]}){
	return result.rows;
}
export function one<T>(result : T[]) {
	return result[0];
}
export function map<S, T>(fun : (element : S) => T){
	return (list : S[]) => list.map(fun)
}
//This is the general case, but no idea how to convey the type.
export function funmap(funs : Array<(el: object) => object>) {
	const union = (element : object) => {
		const reducer = (accumulator : object, fun : Function) : object => ({...accumulator,...fun(element)})
		return funs.reduce(reducer, {})
	}
	return map(union)
}
export function funmap2<A,a,B,b>(
			funA : (el: A) => a, 
			funB : (el : B) => b
			) : (el : Array<A&B>) =>Array<a&b> {
	const union = (element : A&B) => {
		return {...funA(element), ...funB(element)}
	}
	return map(union)
}
export function funmap3<A,a,B,b,C,c>(
			funA : (el: A) => a, 
			funB : (el : B) => b,
			funC : (el : C) => c
			) : (el : Array<A&B&C>) =>Array<a&b&c> {
	const union = (element : A&B&C) => {
		return {...funA(element), ...funB(element),...funC(element)}
	}
	return map(union)
}