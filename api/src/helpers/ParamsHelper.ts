import {Request} from 'express';
import {getEnum, EnumError} from '../../../models/enums/EnumHelper';
import {Sorting} from '../../../models/enums/SortingEnum';

/** Thrown when invlaid request parameters were supplied */
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

/** Get values for the query parameters that are supported across many endpoints */
export function getCommonQueryParams(request: Request, maxLimit = 50) {
    const limit = request.query.limit === undefined ? maxLimit : Number(request.query.limit);
    if (isNaN(limit)) throw new InvalidParamsError("limit", "it is not a number");
    if (limit > maxLimit) throw new InvalidParamsError("limit", `it is not allowed to be larger than ${maxLimit}`);

    const offset = request.query.offset === undefined ? 0 : Number(request.query.offset);
    if (isNaN(offset)) throw new InvalidParamsError("offset", "it is not a number");
    
    //this parameter is currently only looked at by the 'search-' methods in the database.
    //in the future, it might be nice to allow it in other methods too.
    let sorting: Sorting;
    try {
        sorting = request.query.sort ? getEnum(Sorting, request.query.sort as string) : Sorting.datetime
    } catch (e) {
        if (e instanceof EnumError) {
            throw new InvalidParamsError("sort", e.message)
        } else {
            throw e;
        }
    }

    return {limit, offset, sorting};
}
