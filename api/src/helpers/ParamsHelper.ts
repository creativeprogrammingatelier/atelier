import { Request } from 'express';

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

export function getCommonQueryParams(request: Request, maxLimit = 50) {
    const limit = request.query.limit === undefined ? maxLimit : Number(request.query.limit);
    if (isNaN(limit)) throw new InvalidParamsError("limit", "it is not a number");
    if (limit > maxLimit) throw new InvalidParamsError("limit", `it is not allowed to be larger than ${maxLimit}`);

    const offset = request.query.offset === undefined ? 0 : Number(request.query.offset);
    if (isNaN(offset)) throw new InvalidParamsError("offset", "it is not a number");

    return { limit, offset };
}
