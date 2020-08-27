import {Request} from "express";
import {getEnum, EnumError} from "../../../helpers/EnumHelper";
import {Sorting} from "../../../models/enums/SortingEnum";

/** Thrown when invalid request parameters were supplied */
export class InvalidParamsError extends Error {
	reason: string;
	
	constructor(param: string, message?: string) {
		let fullMessage = `Invalid value for parameter "${param}"`;
		if (message !== undefined) {
			fullMessage = fullMessage + ", " + message;
		}
		super(fullMessage);
		this.reason = "invalid.param." + param;
	}
}

/** Get values for the query parameters that are used for pagination */
export function getPaginationQueryParams(request: Request, maxLimit = 700) {
    const limit = request.query.limit === undefined ? undefined : Number(request.query.limit);
	if (limit !== undefined) {
        if (isNaN(limit)) {
            throw new InvalidParamsError("limit", "It is not a number");
        }
        if (limit > maxLimit) {
            throw new InvalidParamsError("limit", `It is not allowed to be larger than ${maxLimit}`);
        }
    }
	
	const offset = request.query.offset === undefined ? undefined : Number(request.query.offset);
	if (offset !== undefined && isNaN(offset)) {
		throw new InvalidParamsError("offset", "It is not a number");
    }
    
    // Return items after (>) and before (<)
    // Both are exclusive, so the latest or oldest known date can be used to do "pagination"
    // Use only after with the date of the newest known item to find new items (will be limited by limit,
    //     but the default limit should be high enough to not cause any problems)
    // Use only before with the oldest known item to do pagination (combined with limit, 
    //     return only the l newest items before t)
    // Before and after can be combined
    const afterNum = Number(request.query.after);
    const after = request.query.after === undefined || !isFinite(afterNum) ? undefined : new Date(afterNum);
    const beforeNum = Number(request.query.before);
    const before = request.query.before === undefined || !isFinite(beforeNum) ? undefined : new Date(beforeNum);

    return {limit, offset, after, before};
}

/** Get values for the query parameters that are supported across many endpoints */
export function getCommonQueryParams(request: Request, maxLimit = 700) {
	const pagination = getPaginationQueryParams(request, maxLimit);
	
	//this parameter is currently only looked at by the 'search-' methods in the database.
	//in the future, it might be nice to allow it in other methods too.
	let sorting: Sorting;
	try {
		sorting = request.query.sort ? getEnum(Sorting, request.query.sort as string) : Sorting.datetime;
	} catch (e) {
		if (e instanceof EnumError) {
			throw new InvalidParamsError("Sort", e.message);
		} else {
			throw e;
		}
	}
	
	return {...pagination, sorting};
}
