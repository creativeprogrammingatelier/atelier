import { Request } from 'express';

export class InvalidParamsError extends Error {
    reason: string;
    constructor(param: string, message?: string) {
        let fullMessage = `Invalid value for query parameter "${param}"`;
        if (message !== undefined) {
            fullMessage = fullMessage + ", " + message;
        }
        super(fullMessage);
        this.reason = "invalid.param." + param;
    }
}

export function getCommonParams(request: Request, maxLimit = 50) {
    const limit = request.params.limit === undefined ? maxLimit : Number(request.params.limit);
    if (isNaN(limit)) throw new InvalidParamsError("limit", "it is not a number");
    if (limit > maxLimit) throw new InvalidParamsError("limit", `it is not allowed to be larger than ${maxLimit}`);

    const offset = request.params.limit === undefined ? 0 : Number(request.params.offset);
    if (isNaN(offset)) throw new InvalidParamsError("offset", "it is not a number");

    return { limit, offset };
}
