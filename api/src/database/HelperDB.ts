import * as pg from "pg"
import { NotFoundDatabaseError, MissingFieldDatabaseError, InvalidDatabaseResonseError } from "./DatabaseErrors";
import { config } from "../helpers/ConfigurationHelper";
import { permissionBits } from "./makeDB";

/**
 * type on which queries can be run
 */
export type pgDB = pg.Pool | pg.PoolClient

/**
 * pool of database connections to use by the rest of the program
 */
export const pool = new pg.Pool({
	...config.database,
	max: 1
});

pool.on("connect", () => console.log("Connected to the database."));

/**
 * export some functions to aid other files in communicating with the database:
 * end = stop the database connection gracefully
 * getClient = get a client from the pool to run queries on, usefull for transactions.
 */
export const end = pool.end.bind(pool);
export const getClient : () => Promise<pg.PoolClient> = pool.connect.bind(pool);
/**
 * check if an object of pgDB is in fact a pool or not.
 */
export function isPool(obj : pgDB) : obj is pg.Pool {
	return Object.is(obj, pool);
}
/**
 * insert into a .then() statement.
 * run @param fun over the promise result if @param cond holds. 
 * otherwise pass the input data on without modification.
 * @param cond condition. true or false
 * @param fun a function to be run over the data
 */
export function doIf<S>(cond : boolean, fun : (input : S) => S) : (input : S)=>S {
	return cond? fun : data => data;
}
/**
 * check if a given name is a valid table name in postgres
 * @param name 
 */
export function isTableName(name : string){
	return true
}
/**
 * convert a number representing a permission object into something postgres likes.
 * giving a number to the postgres query will crash, as postgres cannot implicitly convert from number to bit[n]
 * @param n the permission number
 */
export function toBin(n : number, size?: number) : string
export function toBin(n : undefined, size? : number) : undefined
export function toBin(n : number | undefined, size? : number) : string | undefined
export function toBin(n : number | undefined, size = permissionBits) {
	if (n === undefined) return undefined
	return n.toString(2).padStart(size, '0')
}
/**
 * function to make sure that an @param obj has some properties.
 *  
 * @param required list of properties that should be available
 * @param obj the object to check for availability
 * @throws MissingFieldDatabaseError if a property is missing.
 */
export function checkAvailable(required : string[], obj : {}){
	required.forEach(element => {
		if (!(element in obj)){
			throw new MissingFieldDatabaseError("a required field is missing: "+element)
		}
	});
}
/**
 * check if an object has some key.
 * 
 * @param key the key that might be in the map
 * @param map the map that might contain the key
 */
export function keyInMap<T>(key : string, map : object) : key is keyof typeof map  {
	if (!(key in map)){
		throw new MissingFieldDatabaseError("key "+key+" not found in map");
	}
	return true
}
export function searchify(input : undefined) : undefined
export function searchify(input : string) : string
export function searchify(input : string | undefined) : string | undefined
export function searchify(input : string | undefined){
	if (input === undefined) return undefined
	return '%'+input.replace(/\\/g, '\\\\').replace(/\%/g, '\\%').replace(/\_/g, '\\_')+'%'
}
/**
 * extract the data from a postgres query result
 * @param result the output of a .query() call
 * @returns a list of entries received from the database
 */
export function extract<T>(result : pg.QueryResult<T>){
	return result.rows;
}
/**
 * function to reduce an array of size one to an object.
 * @param result output of the promise chain
 * @throws InvalidDatabaseResonseError if there is not exactly one item in the array.
 */
export function one<T>(result : T[]) {
	if (result.length === 0) {
		throw new InvalidDatabaseResonseError("no database output was found, but expected one")
	}
	if (result.length !== 1){
		console.log(result)
		throw new InvalidDatabaseResonseError('Multiple entries were returned, but expected one')
	}
	const one = result[0];
    if (one === undefined) {
        throw new InvalidDatabaseResonseError('database returned undefined');
    } else {
        return one;
    }
}
/**
 * map a function over a list, in a promise.
 * @param fun a function to be run on every element
 */
export function map<S, T>(fun : (element : S) => T){
	return (list : S[]) => list.map(fun)
}
/**
 * map an array of functions over an array of data. 
 * all functions run on the same input element, to generate some output object.
 * All those objects are combined back into a single result element.
 * this happens for each element in the data array, given to the result of this function.
 * @param funs an array of functions
 */
//This is the general case, but no idea how to convey the type.
export function funmap(funs : Array<(el: object) => object>) {
	const union = (element : object) => {
		const reducer = (accumulator : object, fun : Function) : object => ({...accumulator,...fun(element)})
		return funs.reduce(reducer, {})
	}
	return map(union)
}
/**
 * same a funmap, but now only 2 functions, to keep type-safety.
 * @param funA 
 * @param funB 
 */
export function funmap2<A,a,B,b>(
			funA : (el: A) => a, 
			funB : (el : B) => b
			) : (el : Array<A&B>) =>Array<a&b> {
	const union = (element : A&B) => {
		return {...funA(element), ...funB(element)}
	}
	return map(union)
}
/**
 * same as funmap, but now with a fixed number of functions to keep type-safety.
 */
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

/**
 * some standard elements that might be present on an input object to some database method.
 */
export interface DBTools {
	limit?: number,
	offset?: number,
	client?: pgDB
}