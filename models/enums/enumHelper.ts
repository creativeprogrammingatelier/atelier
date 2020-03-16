import { courseRole } from "./courseRoleEnum";
interface EnumType {
	[id : string] : string
}

export function getEnum<T >(enumer : T, item : string) {
	if (checkEnum(enumer, item)){
		return enumer[item];
	} else {
		const items = '{'+Object.keys(enumer).join(', ')+'}'
		throw new EnumError("item `"+item+"` was expected to be part of the enum "+items+", but wasn't")
	}
}

export function checkEnum<T>(enumer : T, item : string | number | symbol) : item is keyof typeof enumer{
	return item in enumer;
}

//this function adds `item` to enum( : any) 
// tslint:disable-next-line: no-any
export function addItem(enumer : any, item : string) : void {
	if (item in enumer){
		throw new EnumError("tried to add an item to an enum that was already there: "+item+" , enum entries: "+enumer)
	}
	enumer[item] = item;
}

//this function removes `item` from enum( : any) 
// tslint:disable-next-line: no-any
export function removeItem(enumer : any, item : string) : void {
	if (!(item in enumer)){
		throw new EnumError("tried to remove an item from an enum that was not there: "+item+" , enum entries: "+enumer)
	}
	delete enumer[item]
}

export class EnumError extends Error {
	constructor(message = "expected a value to be a member of an enum, but this was not the case"){
		super(message)
	}
}