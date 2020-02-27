import * as pg from "pg"
import { NotFoundDatabaseError } from "./DatabaseErrors";
console.log("helper startup")

export type pgDB = pg.Pool | pg.Client

export const pool = new pg.Pool({
	user: 'assistantassistant',
	host: 'localhost',
	database: 'assistantassistant',
	password: '0disabled-Dusky-lags-Nursery4-Nods-2Floss-Coat-Butte-4Ethel-Hypnosis-bel',
	port: 5432,
	max: 1
});
export const end = pool.end.bind(pool);
export const getClient : () => Promise<pg.PoolClient> = pool.connect.bind(pool);

export function toBin(n : number | undefined){
	if (n === undefined) return undefined
	return n.toString(2).padStart(40, '0')
}
export function checkAvailable(required : string[], obj : {}){
	required.forEach(element => {
		if (!(element in obj)){
			throw new Error("a required field is missing: "+element)
		}
	});
}

export function searchify(input : string){
	return '%'+input.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')+'%'
}
export function extract<T>(result : {rows:T[]}){
	return result.rows;
}
export function one<T>(result : T[]) {
    const one = result[0];
    if (one === undefined) {
        throw new NotFoundDatabaseError();
    } else {
        return one;
    }
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